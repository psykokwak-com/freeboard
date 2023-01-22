//
// Plugin for horizontal linear gauge
//
//

(function() {
    var multiGaugeWidget = function (settings) {
        var titleElement = $('<h2 class="section-title"></h2>');
        var gaugeElement = $('<div></div>');

        var self = this;
        var paper = null;
        var gaugeFill = new Array;
        var width, height;
        var valueText = new Array, unitsText = new Array;
        var minValueLabel = new Array, maxValueLabel = new Array;
        //var currentValue = 0;
        //var colors = ["#a9d70b", "#f9c802", "#ff0000"];

        var currentSettings = settings;

        /* get the color for a fill percentage
           these colors match the justGage library for radial guagues */
        function getColor(fillPercent) {
            // mix colors
            // green rgb(169,215,11) #a9d70b
            // yellow rgb(249,200,2) #f9c802
            // red rgb(255,0,0) #ff0000

            if (fillPercent >= 0.5 ) {
                fillPercent = 2 * fillPercent - 1;
                var R = fillPercent * 255 + (1 - fillPercent) * 249;
                var G = fillPercent * 0 + (1 - fillPercent) * 200;
                var B = fillPercent * 0 + (1 - fillPercent) * 2;
            }
            else {
                fillPercent = 2 * fillPercent;
                var R = fillPercent * 249 + (1 - fillPercent) * 169;
                var G = fillPercent * 200 + (1 - fillPercent) * 215;
                var B = fillPercent * 2 + (1 - fillPercent) * 11;
            }

            return "rgb(" + Math.round(R) + "," + Math.round(G) + "," + Math.round(B) + ")"
        }

        self.render = function (element) {
            $(element).append(titleElement.html(currentSettings.title)).append(gaugeElement);

            width = gaugeElement.width();
            height = currentSettings.nb_gauges * 25;

            var gaugeWidth = 160;
            var gaugeHeight = 20;

            paper = Raphael(gaugeElement.get()[0], width, height);
            paper.clear();

			for (var gauge_i = 0; gauge_i < currentSettings.nb_gauges; ++gauge_i) {
			    var y_center_gauge_i = gauge_i * 25 + gaugeHeight / 2;
	            var rect = paper.rect(width / 2 - gaugeWidth / 2, y_center_gauge_i - gaugeHeight / 2, gaugeWidth, gaugeHeight);
	            rect.attr({
	                "fill": "#edebeb",
	                "stroke": "#edebeb"
	            });

	            // place min and max labels
	            var minValueLabel_i = paper.text(width / 2 - gaugeWidth / 2 - 8, y_center_gauge_i, currentSettings.min_value);
	            var maxValueLabel_i = paper.text(width / 2 + gaugeWidth / 2 + 8, y_center_gauge_i, currentSettings.max_value);

				minValueLabel.push(minValueLabel_i);
				maxValueLabel.push(maxValueLabel_i);

	            minValueLabel_i.attr({
	                "font-family": "arial",
	                "font-size": "10",
	                "fill": "#b3b3b3",
	                "text-anchor": "end"
	            });

	            maxValueLabel_i.attr({
	                "font-family": "arial",
	                "font-size": "10",
	                "fill": "#b3b3b3",
	                "text-anchor": "start"
	            });

	            // fill to 0 percent
	            var gaugeFill_i = paper.rect(width / 2 - gaugeWidth / 2, y_center_gauge_i - gaugeHeight / 2, 0, gaugeHeight);
	            gaugeFill.push(gaugeFill_i);

	            // place units and value
	            var units = _.isUndefined(currentSettings.units) ? "" : currentSettings.units;

	            var valueText_i = paper.text(width / 2, y_center_gauge_i, "");
	            var unitsText_i = paper.text(width / 2, y_center_gauge_i, units);

	            valueText.push(valueText_i);
	            unitsText.push(unitsText_i);
	            
	            valueText_i.attr({
	                "font-family": "arial",
	                "font-size": "16",
	                "font-weight": "bold",
	                "fill": "#000000",
	                "text-anchor": "end"
	            });

	            unitsText_i.attr({
	                "font-family": "arial",
	                "font-size": "16",
	                "font-weight": "normal",
	                "fill": "#000000",
	                "text-anchor": "start"
	            });
			}
        }

        self.onSettingsChanged = function (newSettings) {
            if (newSettings.units != currentSettings.units || newSettings.min_value != currentSettings.min_value || newSettings.max_value != currentSettings.max_value) {
                currentSettings = newSettings;
                var units = _.isUndefined(currentSettings.units) ? "" : currentSettings.units;
                var min = _.isUndefined(currentSettings.min_value) ? 0 : currentSettings.min_value;
                var max = _.isUndefined(currentSettings.max_value) ? 0 : currentSettings.max_value;

				unitsText.forEach((elt) => {elt.attr({"text": units})});
				minValueLabel.forEach((elt) => {elt.attr({"text": min})});
				maxValueLabel.forEach((elt) => {elt.attr({"text": max})});
            }
            else {
                currentSettings = newSettings;
            }

            titleElement.html(newSettings.title);
        }

        self.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName === "value") {
                if (!_.isUndefined(gaugeFill) && !_.isUndefined(valueText)) {

					var elt_i = 0;
					for(var elt in newValue) {
	                    var newValue_i = _.isUndefined(newValue[elt]) ? 0 : newValue[elt];
	                    var fillVal = 160 * (newValue_i - currentSettings.min_value)/(currentSettings.max_value - currentSettings.min_value);

	                    fillVal = fillVal > 160 ? 160 : fillVal;
	                    fillVal = fillVal < 0 ? 0 : fillVal;

	                    var fillColor = getColor(fillVal / 160);

	                    gaugeFill[elt_i].animate({"width": fillVal, "fill": fillColor, "stroke": fillColor}, 500, ">");
	                    valueText[elt_i].attr({"text": newValue_i});
	                    elt_i++;
	                    if(elt_i >= currentSettings.nb_gauges) break;
	                }
                }
            }
        }

        self.onDispose = function () {
        }

        self.getHeight = function () {
            // a block is about 45px height
            return Math.ceil(currentSettings.nb_gauges*25 / 45);
        }

    };

    freeboard.loadWidgetPlugin({
        type_name: "multi-horizontal-gauges",
        display_name: "Multiple Horizontal Gauges",
        "external_scripts" : [
         "plugins/thirdparty/raphael.2.1.0.min.js"
        ],
        fill_size: true,
        settings: [
            {
                name: "title",
                display_name: "Title",
                type: "text"
            },
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            },
            {
                name: "nb_gauges",
                display_name: "Number of gauges",
                type: "number",
                default_value: 1
            },
            {
                name: "units",
                display_name: "Units",
                type: "text"
            },
            {
                name: "min_value",
                display_name: "Minimum",
                type: "number",
                default_value: 0
            },
            {
                name: "max_value",
                display_name: "Maximum",
                type: "number",
                default_value: 100
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new multiGaugeWidget(settings));
        }
    });
}());
