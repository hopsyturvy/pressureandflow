(function ($) {

    var options = {
        series: {
            curvedLines: {
                active: false,
                apply: false,
                fit: false,
                curvePointFactor: 20,
                fitPointDist: 0.0001
            }
        }
    };

    function init(plot) {

        plot.hooks.processOptions.push(processOptions);

        //if the plugin is active register processDatapoints method
        function processOptions(plot, options) {

            if (options.series.curvedLines.active) {
                plot.hooks.processDatapoints.push(processDatapoints);
            }
        }

        //only if the plugin is active
        function processDatapoints(plot, series, datapoints) {
            if (series.curvedLines.apply == true) {
                if (series.lines.fill) {

                    var pointsTop = calculateCurvePoints(datapoints, series.curvedLines, 1)
                        , pointsBottom = calculateCurvePoints(datapoints, series.curvedLines, 2); //flot makes sur for us that we've got a second y point if fill is true !

                    //Merge top and bottom curve
                    datapoints.pointsize = 3;
                    datapoints.points = [];
                    var j = 0;
                    var k = 0;
                    var i = 0;
                    var ps = 2;
                    while (i < pointsTop.length || j < pointsBottom.length) {
                        if (pointsTop[i] == pointsBottom[j]) {
                            datapoints.points[k] = pointsTop[i];
                            datapoints.points[k + 1] = pointsTop[i + 1];
                            datapoints.points[k + 2] = pointsBottom[j + 1];
                            j += ps;
                            i += ps;

                        } else if (pointsTop[i] < pointsBottom[j]) {
                            datapoints.points[k] = pointsTop[i];
                            datapoints.points[k + 1] = pointsTop[i + 1];
                            datapoints.points[k + 2] = k > 0 ? datapoints.points[k - 1] : null;
                            i += ps;
                        } else {
                            datapoints.points[k] = pointsBottom[j];
                            datapoints.points[k + 1] = k > 1 ? datapoints.points[k - 2] : null;
                            datapoints.points[k + 2] = pointsBottom[j + 1];
                            j += ps;
                        }
                        k += 3;
                    }

                    if (series.lines.lineWidth > 0) {//Let's draw line in separate series
                        var newSerie = $.extend({}, series);
                        newSerie.lines = $.extend({}, series.lines);
                        newSerie.lines.fill = undefined;
                        newSerie.label = undefined;
                        newSerie.datapoints = {};
                        //Redefine datapoints to top only (else it can have null values which will open the cruve !)
                        newSerie.datapoints.points = pointsTop;
                        newSerie.datapoints.pointsize = 2;
                        newSerie.curvedLines.apply = false;
                        //Don't redo curve point calculation as datapoint is copied to this new serie
                        //We find our series to add the line just after the fill (so other series you wanted above this one will still be)
                        var allSeries = plot.getData();
                        for (i = 0; i < allSeries.length; i++) {
                            if (allSeries[i] == series) {
                                plot.getData().splice(i + 1, 0, newSerie);
                                break;
                            }
                        }

                        series.lines.lineWidth = 0;
                    }

                } else if (series.lines.lineWidth > 0) {
                    datapoints.points = calculateCurvePoints(datapoints, series.curvedLines, 1);
                    datapoints.pointsize = 2;
                }
            }
        }

        //no real idea whats going on here code mainly from https://code.google.com/p/flot/issues/detail?id=226
        //if fit option is selected additional datapoints get inserted before the curve calculations in nergal.dev s code.
        function calculateCurvePoints(datapoints, curvedLinesOptions, yPos) {

            var points = datapoints.points, ps = datapoints.pointsize;
            var num = curvedLinesOptions.curvePointFactor * (points.length / ps);

            var xdata = new Array;
            var ydata = new Array;

            var X = 0;
            var Y = yPos;

            var curX = -1;
            var curY = -1;
            var j = 0;

            if (curvedLinesOptions.fit) {
                //insert a point before and after the "real" data point to force the line
                //to have a max,min at the data point however only if it is a lowest or highest point of the
                //curve => avoid saddles
                var fpDist = curvedLinesOptions.fitPointDist;

                for (var i = 0; i < points.length; i += ps) {

                    var front = new Array;
                    var back = new Array;
                    curX = i;
                    curY = i + yPos;

                    //add point to front
                    front[X] = points[curX] - fpDist;
                    front[Y] = points[curY];

                    //add point to back
                    back[X] = points[curX] + fpDist;
                    back[Y] = points[curY];


                    //get points (front and back) Y value for saddle test
                    var frontPointY = points[curY];
                    var backPointY = points[curY];
                    if (i >= ps) {
                        frontPointY = points[curY - ps];
                    }
                    if ((i + ps) < points.length) {
                        backPointY = points[curY + ps];
                    }

                    //test for a saddle
                    if ((frontPointY <= points[curY] && backPointY <= points[curY]) || //max or partial horizontal
                        (frontPointY >= points[curY] && backPointY >= points[curY])) {//min or partial horizontal

                        //add curve points
                        xdata[j] = front[X];
                        ydata[j] = front[Y];
                        j++;

                        xdata[j] = points[curX];
                        ydata[j] = points[curY];
                        j++;

                        xdata[j] = back[X];
                        ydata[j] = back[Y];
                        j++;
                    } else {//saddle
                        //use original point only
                        xdata[j] = points[curX];
                        ydata[j] = points[curY];
                        j++;
                    }

                }
            } else {
                //just use the datapoints
                for (var i = 0; i < points.length; i += ps) {
                    curX = i;
                    curY = i + yPos;

                    xdata[j] = points[curX];
                    ydata[j] = points[curY];
                    j++;
                }
            }

            var n = xdata.length;

            var y2 = new Array();
            var delta = new Array();
            y2[0] = 0;
            y2[n - 1] = 0;
            delta[0] = 0;

            for (var i = 1; i < n - 1; ++i) {
                var d = (xdata[i + 1] - xdata[i - 1]);
                if (d == 0) {
                    return null;
                }

                var s = (xdata[i] - xdata[i - 1]) / d;
                var p = s * y2[i - 1] + 2;
                y2[i] = (s - 1) / p;
                delta[i] = (ydata[i + 1] - ydata[i]) / (xdata[i + 1] - xdata[i]) - (ydata[i] - ydata[i - 1]) / (xdata[i] - xdata[i - 1]);
                delta[i] = (6 * delta[i] / (xdata[i + 1] - xdata[i - 1]) - s * delta[i - 1]) / p;
            }

            for (var j = n - 2; j >= 0; --j) {
                y2[j] = y2[j] * y2[j + 1] + delta[j];
            }

            var step = (xdata[n - 1] - xdata[0]) / (num - 1);

            var xnew = new Array;
            var ynew = new Array;
            var result = new Array;

            xnew[0] = xdata[0];
            ynew[0] = ydata[0];

            result.push(xnew[0]);
            result.push(ynew[0]);

            for (j = 1; j < num; ++j) {
                xnew[j] = xnew[0] + j * step;

                var max = n - 1;
                var min = 0;

                while (max - min > 1) {
                    var k = Math.round((max + min) / 2);
                    if (xdata[k] > xnew[j]) {
                        max = k;
                    } else {
                        min = k;
                    }
                }

                var h = (xdata[max] - xdata[min]);

                if (h == 0) {
                    return null;
                }

                var a = (xdata[max] - xnew[j]) / h;
                var b = (xnew[j] - xdata[min]) / h;

                ynew[j] = a * ydata[min] + b * ydata[max] + ((a * a * a - a) * y2[min] + (b * b * b - b) * y2[max]) * (h * h) / 6;

                result.push(xnew[j]);
                result.push(ynew[j]);
            }

            return result;
        }

    }//end init

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'curvedLines',
        version: '0.5'
    });

})(jQuery);