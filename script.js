(() => {
  "use strict";

  let config = {
    playing: false,
    paused: true,
    repeat: 0,
    yoyo: false,
    autoRotate: false,
    animSpeed: 5,
    type: 'thru',
    timeResolution: 6,
    ease: Linear.easeNone,
    properties: "leftTop",
    curviness: 5,
    curves: 1
    //force3d: true,
  };

  let windowWidth = () => $(window).outerWidth(true);

  let windowHeight = () => $(window).outerHeight(true);

  const WW = windowWidth();
  const WH = windowHeight();

  //Return a window height % as a pixel value
  let yPercentToPx = y => windowHeight() / 100 * y;

  //Return a window width % as a pixel value
  let xPercentToPx = x => windowHeight() / 100 * x;

  let setElementSizes = goose => {
    let $container = $('#container');
    let spacing = 30;

    let titleHeight = $('#title').height();

    $container.css({ top: titleHeight + spacing + "px" });

    $container.css({ height: $("#build-curve").height() + spacing + "px" });

    $('#content').css({ height: $container.height() + "px" });

    $("#code").css({ bottom: "2%" });

    $("#code-container").css({ top: titleHeight + spacing + $container.height() + spacing + "px" });

    goose.left = windowWidth() - parseFloat($("#controls").css("width")) / 2;
    goose.top = titleHeight + 150 + $("#controls").height();

    $("#goose").css({
      left: goose.left,
      top: goose.top });

  };

  // ***********************************************************************************
  // *
  // *  This function allows us to visualize TweenMAx Bezier curves by drawing a 
  // *  series of points along the curve
  // *
  // ***********************************************************************************
  let visualizeTweenMaxBezier = (tween, steps) => {
    //remove any existing curve
    $("#show-curve").empty();

    for (let i = 0; i < steps - 1; i++) {

      tween.progress(i / steps);

      $("#show-curve").append("<div id='point" + i + "'></div>");

      $("#point" + i).css({
        position: "absolute",
        width: "2px",
        height: "2px",
        "background-color": "#7F7F7F",
        top: tween.target.css("top"),
        left: tween.target.css("left") });

    }
    tween.restart();
  };

  //Document ready
  $(() => {

    // ***********************************************************************************
    // *
    // *  Lets create a timeline to animate the goose
    // *  
    // *
    // ***********************************************************************************
    let $goose = $('goose');

    let goose = {
      elem: '#goose',
      left: 0,
      top: 0 };


    setElementSizes(goose);

    //Draggable.create(goose.elem, {
    //	onRelease: reset,
    //});

    let pointDist = WW / 10;


    let values = [goose.left - pointDist];

    let d = 1;
    for (let i = 1; i < 8; i++) {
      if (i % 2 === 0) {
        values[i] = values[i - 2] - pointDist;
      } else
      {
        values[i] = goose.top + pointDist * d / 2;
        d *= -1;
      }
    }

    let quadValues = values.slice(0, 6);

    let createBezier = values => {
      let curve = [];

      //create an array of objects with either x,y or left, top attributes
      for (let i = 0; i < values.length; i += 2) {
        if (config.properties === "leftTop") {
          curve.push({
            left: values[i],
            top: values[i + 1] });

        } else
        {
          curve.push({
            x: values[i],
            y: values[i + 1] });

        }
      }
      return curve;
    };

    let bezier = createBezier(values);

    let buildTimeline = () => {
      let timeline = new TimelineMax({
        paused: config.paused,
        repeat: config.repeat,
        yoyo: config.yoyo,
        onStart: () => {
          $('#playBtn').html('Pause');
          config.playing = true;
        },
        onComplete: () => {
          $('#playBtn').html('Reset');
          config.playing = false;
        } });


      let move = TweenMax.to(goose.elem, config.animSpeed, {
        bezier: {
          type: config.type,
          timeResolution: config.timeResolution,
          values: bezier,
          autoRotate: config.autoRotate },

        ease: config.ease });


      timeline.add(move, 0);

      visualizeTweenMaxBezier(move, 200);

      return timeline;
    };

    goose.timeline = buildTimeline();

    // ***********************************************************************************
    // *
    // *  Lets do it all again but put it to the screen so that it can be copied
    // *  
    // *
    // ***********************************************************************************

    let displayCode = () => {
      let code = "";
      let timeline = "let timeline = new TimelineMax({ \n";
      timeline += "    paused: " + config.paused + ", \n";
      timeline += "    repeat: " + config.repeat + ", \n";
      timeline += "    yoyo: " + config.yoyo + ",";
      timeline += " \n});";

      code += timeline;

      let curve = "\n\nlet curve =";

      curve += "[\n";
      //create an array of objects with either x,y or left, top attributes
      for (let i = 0; i < values.length; i += 2) {
        if (config.properties === "leftTop") {
          curve += "    {\n";
          curve += "        left: " + values[i] + ",\n";
          curve += "        top: " + values[i + 1] + ",\n";
          curve += "    },\n";
        } else
        {
          curve += "    {\n";
          curve += "        x: " + values[i] + ",\n";
          curve += "        y: " + values[i + 1] + ",\n";
          curve += "    },\n";
        }
      }
      curve += "]\n";

      code += curve;

      let tween = "\nlet tween = TweenMax.to(goose.elem, config.animSpeed, {\n";
      tween += "    bezier:{\n";
      tween += "        type: " + config.type + ",\n";
      tween += "        curviness: " + config.curviness + ",\n";
      tween += "        timeResolution: " + config.timeResolution + ",\n";
      tween += "        values: curve,\n";
      tween += "        autoRotate: " + config.autoRotate + ",\n";
      tween += "	},\n";
      tween += "    ease: Linear.easeNone,\n";;
      tween += "});\n";
      code += tween;

      code += "\ntimeline.add(tween, 0);";

      //count how many lines of code we have so that the textarea can be resized
      let lines = code.split(/[\n\r]/g).length + config.curves;

      let lineHeight = "15";

      $("#code").css({
        'line-height': lineHeight + "px",
        height: lines * lineHeight + "px" });

      $('#code').html(code);

      $("#code-container").css({
        height: lines * lineHeight + 100 + "px" });

    };

    displayCode();

    // ***********************************************************************************
    // *
    // *  Reset everything after options/points have changed
    // *  
    // *
    // ***********************************************************************************

    let reset = () => {
      setElementSizes(goose);
      TweenMax.killAll();

      if (config.type === "soft" || config.type === "quadratic") {
        bezier = createBezier(quadValues);
      } else
      {
        bezier = createBezier(values);
      }

      goose.timeline = buildTimeline();
      displayCode();
      showPoints();


    };

    // ***********************************************************************************
    // *
    // *  Draw the control points on the screen
    // *  
    // *
    // ***********************************************************************************

    let showPoints = () => {

      function onDrag(i) {
        return function (e) {
          let $target = $('#' + this.target.attributes[0].nodeValue);

          if (config.type === "soft" || config.type === "quadratic") {
            quadValues[i * 2] = parseFloat($target.css('left'));
            quadValues[i * 2 + 1] = parseFloat($target.css('top'));
          } else
          {
            values[i * 2] = parseFloat($target.css('left'));
            values[i * 2 + 1] = parseFloat($target.css('top'));
          }
        };
      };

      //get rid of any existing points
      $("#show-points").empty();

      let i = 0;
      for (let point of bezier) {
        $("#show-points").append("<div id='control-point" + i + "'></div>");

        $("#control-point" + i).css({
          position: "absolute",
          width: "8px",
          height: "8px",
          "background-color": "#5422A7",
          "border-radius": "40px",
          border: "solid #7F7F7F 1px",
          top: point[Object.keys(point)[1]] + "px",
          left: point[Object.keys(point)[0]] - 3 + "px" });


        Draggable.create("#control-point" + i, {
          type: "top,left",
          onDrag: onDrag(i),
          onRelease: reset });


        i++;
      }
    };

    showPoints();

    // ***********************************************************************************
    // *
    // *  Set up the play/pause/reset button
    // *  
    // *
    // ***********************************************************************************
    $('#playBtn').click(() => {
      if ($('#playBtn').html() === 'Reset') {
        goose.timeline.restart();
        goose.timeline.play();
        $('#playBtn').html('Pause');
      }
      if ($('#playBtn').html() === 'Play') {
        goose.timeline.play();
        $('#playBtn').html('Pause');
      } else
      {
        $('#playBtn').html('Play');
        goose.timeline.pause();
      }
    });

    // ***********************************************************************************
    // *
    // *  Set up options for the timeline
    // *  
    // *
    // ***********************************************************************************

    //Whether animation should be paused at the start
    $('#paused').click(() => {
      config.paused = $("#paused").is(":checked") ? true : false;
      reset();
    });
    //repeat infinitely or once
    $('#repeat').click(() => {
      config.repeat = $("#repeat").is(":checked") ? -1 : 0;
      reset();
    });
    $('#yoyo').click(() => {
      config.yoyo = $("#yoyo").is(":checked") ? true : false;
      reset();
    });
    //autoRotate or not, with 180 degrees added to stop the goose being upside down
    $('#autoRotate').click(() => {
      config.autoRotate = $("#autoRotate").is(":checked") ? 180 : false;
      TweenMax.killAll();
      TweenMax.to(goose.elem, 0, { rotationZ: 0, ease: Quad.easeInOut });
      goose.timeline = buildTimeline();
    });

    //overall animation speed across all curves
    $("#speed").keyup(function (e) {
      if (this.value === "") {//don't run if no text has been entered
        return false;
      };
      if (isNaN(this.value) || this.value < 0) {
        this.value = this.defaultValue;
      }
      config.animSpeed = this.value;

      reset();
    });

    //set the time resolution
    $("#timeResolution").keyup(function (e) {
      if (this.value === "") {//don't run if no text has been entered
        return false;
      };
      if (isNaN(this.value) || this.value < 0) {
        this.value = this.defaultValue;
      }
      config.timeResolution = this.value;

      reset();
    });

    //thru, soft, quadratic, or cubic
    //hides the curviness option for all but soft
    //and second control points for quadratic
    $('#type').change(() => {
      config.type = $('#type').val();
      reset();
    });

    //animate via left and top or x and y
    $('#properties').change(() => {
      config.properties = $('#properties').val();
      reset();
    });

    //curviness value for thru type curves
    $("#curviness").keyup(function (e) {
      if (this.value === "") {//don't run if no text has been entered
        return false;
      };
      if (isNaN(this.value) || this.value < 0) {
        this.value = this.defaultValue;
      }

      config.curviness = this.value;
      reset();
    });

    //add a curve and resize elements if we have lots of curves
    $("#add-curve").click(() => {
      config.curves++;
      let num = config.curves + 1;

      let len = values.length;

      for (let i = 0; i < 6; i++) {
        if (i % 2 === 0) {
          values.push(values[values.length - 2] - 50);
        } else
        {
          values.push(values[i]);
        }
      }

      for (let i = 0; i < 4; i++) {
        if (i % 2 === 0) {
          quadValues.push(values[values.length - 2] - 50);
        } else
        {
          quadValues.push(values[i]);
        }
      }

      $("#rem-curve").show();
      reset();
    });

    //remove the last added curve and resize elements if neccessary
    $("#rem-curve").click(() => {
      config.curves--;

      if (config.curves < 2) {
        $("#rem-curve").hide();
      }

      for (let i = 0; i < 6; i++) {
        values.pop();
      }

      for (let i = 0; i < 4; i++) {
        quadValues.pop();
      }

      reset();
    });

    //Detect changes to any of the points and update the curve
    $("#points :text").change(function (e) {
      if (this.value === "") {//don't run if no text has been entered
        return false;
      };
      reset();
    });

    $(window).resize(_.debounce(() => {
      setElementSizes(goose);
      reset();
    }, 300));

  }); //end document ready

})();