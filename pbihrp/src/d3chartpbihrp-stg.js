(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "pfbi.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles-stg.css", "https://cbpfgms.github.io/css/d3chartstylespbihrp-stg.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js",
		html2ToCanvas = "https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
		URLSearchParamsPolyfill = "https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
		fetchPolyfill1 = "https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 = "https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

	//CHANGE CSS LINK!!!!!!!!!!!!!!

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			if (cssLink === fontAwesomeLink) {
				externalCSS.setAttribute("integrity", "sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/");
				externalCSS.setAttribute("crossorigin", "anonymous")
			};
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isScriptLoaded(d3URL)) {
		if (hasFetch && hasURLSearchParams) {
			loadScript(d3URL, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(d3URL, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(d3URL, d3Chart);
					});
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			d3Chart();
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, d3Chart);
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, d3Chart);
				});
			});
		};
	} else {
		let d3Script;
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == d3URL) d3Script = scripts[i];
		};
		d3Script.addEventListener("load", d3Chart);
	};

	function loadScript(url, callback) {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	};

	function isStyleLoaded(url) {
		const styles = document.getElementsByTagName('link');
		for (let i = styles.length; i--;) {
			if (styles[i].href == url) return true;
		}
		return false;
	};

	function isScriptLoaded(url) {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == url) return true;
		}
		return false;
	};

	function d3Chart() {

		//POLYFILLS

		//Array.prototype.find()

		if (!Array.prototype.find) {
			Object.defineProperty(Array.prototype, 'find', {
				value: function(predicate) {
					if (this == null) {
						throw new TypeError('"this" is null or not defined');
					}
					var o = Object(this);
					var len = o.length >>> 0;
					if (typeof predicate !== 'function') {
						throw new TypeError('predicate must be a function');
					}
					var thisArg = arguments[1];
					var k = 0;
					while (k < len) {
						var kValue = o[k];
						if (predicate.call(thisArg, kValue, k, o)) {
							return kValue;
						}
						k++;
					}
					return undefined;
				},
				configurable: true,
				writable: true
			});
		};

		//toBlob

		if (!HTMLCanvasElement.prototype.toBlob) {
			Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
				value: function(callback, type, quality) {
					var dataURL = this.toDataURL(type, quality).split(',')[1];
					setTimeout(function() {

						var binStr = atob(dataURL),
							len = binStr.length,
							arr = new Uint8Array(len);

						for (var i = 0; i < len; i++) {
							arr[i] = binStr.charCodeAt(i);
						}

						callback(new Blob([arr], {
							type: type || 'image/png'
						}));

					});
				}
			});
		};

		//END OF POLYFILLS

		const width = 1100,
			padding = [12, 8, 4, 8],
			panelHorizontalPadding = 4,
			panelVerticalPadding = 12,
			buttonsPanelHeight = 36,
			topSummaryPanelHeight = 80,
			stackedBarPanelHeight = 94,
			donutsPanelHeight = 58,
			barGroupHeight = 50,
			nonHrpBarHeight = 24,
			buttonsNumber = 12,
			sortMenuRectangleOpacity = 0.85,
			sortMenuVertAlign = -2,
			duration = 1000,
			topSummaryBarsHeight = 10,
			stackedBarHeight = 16,
			barChartLabelPadding = 3,
			barChartLabelVertPadding = 10,
			barChartPercentageLabelPadding = 6,
			barChartPercentageLabelVertPadding = 8,
			formatPercent = d3.format(".0%"),
			unBlue = "#1F69B3",
			colorsArray = ["#1175BA", "#9BB9DF", "#8A8C8E", "#C7C8CA"], //dark blue, light blue, dark gray, light gray
			variablesArray = ["cbpffunding", "cbpftarget", "hrpfunding", "hrprequirements"],
			yScaleBarChartInnerDomain = ["HRP", "CBPF"],
			legendRectangleSize = 16,
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			localVariable = d3.local(),
			chartTitleDefault = "CBPF versus HRP",
			vizNameQueryString = "cbpfvshrp",
			bookmarkSite = "https://pfbi.unocha.org/bookmark.html?",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			sortByValues = {
				cbpffunding: "CBPF Funding",
				cbpfpercentage: "CBPF Percentage of the Target Achieved",
				hrpfunding: "HRP Funding",
				hrprequirements: "HRP Requirements",
				cbpftarget: "CBPF Target",
				alphabetically: "Alphabetically"
			},
			legendNamesArray = ["HRP Requirements", "HRP Funding", "CBPF Funding"],
			sortByArray = Object.keys(sortByValues),
			dataFile = "https://cbpfapi.unocha.org/vo2/odata/HRPCBPFFundingSummary?PoolfundCodeAbbrv=&$format=csv",
			totalValues = {},
			chartState = {
				selectedYear: null,
				sortBy: null,
			};

		let isSnapshotTooltipVisible = false,
			height = 600,
			yearsArray,
			targetPercentage = "15%", //CHANGE???
			activeSortMenu = false,
			currentHoveredElement;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbihrp");

		const showHelp = containerDiv.node().getAttribute("data-showhelp") === "true";

		const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

		const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year") : containerDiv.node().getAttribute("data-year");

		chartState.sortBy = queryStringValues.has("sortby") && sortByArray.indexOf(queryStringValues.get("sortby").replace(" ", "").toLowerCase()) > -1 ? queryStringValues.get("sortby").replace(" ", "").toLowerCase() :
			sortByArray.indexOf(containerDiv.node().getAttribute("data-sortby").replace(" ", "").toLowerCase()) > -1 ? containerDiv.node().getAttribute("data-sortby").replace(" ", "").toLowerCase() :
			"cbpffunding";

		if (chartState.sortBy === "cbpftarget") chartState.sortBy = "hrpfunding";

		if (!selectedResponsiveness) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbihrpTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbihrpTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbihrpIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbihrpFooterDiv") : null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbihrpSnapshotTooltip")
			.attr("class", "pbihrpSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbihrpSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "pbihrpSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "pbihrpTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "pbihrptooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function() {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] - 4 + "px");
		});

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbihrpbuttonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 6, 0],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18
		};

		const topSummaryPanel = {
			main: svg.append("g")
				.attr("class", "pbihrptopSummaryPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelVerticalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: topSummaryPanelHeight,
			titlePadding: 30,
			padding: [0, 0, 0, 0]
		};

		const topSummaryPanelCbpf = {
			main: topSummaryPanel.main.append("g")
				.attr("class", "pbihrptopSummaryPanelCbpf")
				.attr("transform", "translate(0," + topSummaryPanel.titlePadding + ")"),
			width: topSummaryPanel.width / 2 - panelVerticalPadding / 2,
			height: topSummaryPanel.height - topSummaryPanel.padding[0] - topSummaryPanel.padding[2] - topSummaryPanel.titlePadding,
			padding: [0, 40, 0, 314],
			valuePadding: 148,
			valueVerPadding: 11
		};

		const topSummaryPanelHrp = {
			main: topSummaryPanel.main.append("g")
				.attr("class", "pbihrptopSummaryPanelHrp")
				.attr("transform", "translate(" + (topSummaryPanel.width / 2 + panelVerticalPadding / 2) + "," + topSummaryPanel.titlePadding + ")"),
			width: topSummaryPanel.width / 2 - panelVerticalPadding / 2,
			height: topSummaryPanel.height - topSummaryPanel.padding[0] - topSummaryPanel.padding[2] - topSummaryPanel.titlePadding,
			padding: [0, 40, 0, 314],
			valuePadding: 148,
			valueVerPadding: 11
		};

		const stackedBarPanel = {
			main: svg.append("g")
				.attr("class", "pbihrpstackedBarPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + topSummaryPanel.height + 2 * panelVerticalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: stackedBarPanelHeight,
			padding: [20, 2, 26, 0],
			labelPadding: 10,
			labelHorPadding: 8
		};

		const donutsPanel = {
			main: svg.append("g")
				.attr("class", "pbihrpdonutsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + topSummaryPanel.height + stackedBarPanel.height + 3 * panelVerticalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: donutsPanelHeight,
			padding: [8, 274, 0, 420],
			valuePadding: 148,
			valueVerPadding: 11
		};

		const barChartPanel = {
			main: svg.append("g")
				.attr("class", "pbihrpbarChartPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + topSummaryPanel.height + stackedBarPanel.height + donutsPanel.height + 6 * panelVerticalPadding) + ")"),
			width: width - padding[1] - padding[3],
			padding: [70, 32, 0, 192],
			get mainAxisPadding() {
				return this.padding[3] - 100;
			},
			donutPadding: 30,
			get titlePadding() {
				return this.padding[0] * 0.4;
			},
			get legendPadding() {
				return this.padding[0] * 0.5;
			}
		};

		const nonHrpPanel = {
			main: svg.append("g")
				.attr("class", "pbihrpnonHrpPanel"),
			width: width - padding[1] - padding[3],
			padding: [24, 32, 0, 192],
			get mainAxisPadding() {
				return this.padding[3] - 48;
			}
		};

		const sortMenuPanel = {
			main: svg.append("g")
				.attr("class", "pbihrpsortMenuPanel")
				.attr("transform", "translate(" + (barChartPanel.width - 300) + "," +
					(padding[0] + buttonsPanel.height + topSummaryPanel.height + stackedBarPanel.height + donutsPanel.height + barChartPanel.legendPadding + 6 * panelVerticalPadding) + ")"),
			width: 258,
			height: 102,
			padding: [0, 0, 0, 4],
			titlePadding: 48,
			itemPadding: 16,
			groupHeight: 20,
			circleSize: 6,
			innerCircleSize: 3
		};

		const arcGenerator = d3.arc()
			.outerRadius((donutsPanel.height - donutsPanel.padding[0] - donutsPanel.padding[2]) / 2 - 5)
			.innerRadius((donutsPanel.height - donutsPanel.padding[0] - donutsPanel.padding[2]) / 2 - 10);

		const donutGenerator = d3.pie()
			.value(function(d) {
				return d.value;
			})
			.sort(null);

		const donutsPanelScale = d3.scalePoint()
			.range([donutsPanel.padding[3], donutsPanel.width - donutsPanel.padding[1]]);

		const colorsScale = d3.scaleOrdinal()
			.domain(variablesArray)
			.range(colorsArray);

		const topSummaryScale = d3.scaleLinear()
			.range([topSummaryPanelCbpf.padding[3], topSummaryPanelCbpf.width - topSummaryPanelCbpf.padding[1]]);

		const stackedBarScale = d3.scaleLinear()
			.range([stackedBarPanel.padding[3], stackedBarPanel.width - stackedBarPanel.padding[1]]);

		const yScaleBarChartMain = d3.scaleBand();

		const yScaleBarChartInner = d3.scaleBand()
			.domain(yScaleBarChartInnerDomain)
			.range([0, barGroupHeight])
			.paddingOuter(0.75)
			.paddingInner(0.2);

		const xScaleBarChart = d3.scaleLinear()
			.range([barChartPanel.padding[3], barChartPanel.width - barChartPanel.padding[1]]);

		const yScaleBarChartNonHrp = d3.scaleBand();

		const yScaleBarChartNonHrpInner = d3.scaleBand()
			.domain([yScaleBarChartInnerDomain[1]])
			.range([0, nonHrpBarHeight])
			.paddingOuter(0.5);

		const xScaleBarChartNonHrp = d3.scaleLinear()
			.range([nonHrpPanel.padding[3], nonHrpPanel.width - nonHrpPanel.padding[1]]);

		const yAxisBarChartMain = d3.axisLeft(yScaleBarChartMain);

		const yAxisBarChartInner = d3.axisLeft(yScaleBarChartInner)
			.tickSize(4);

		const yAxisBarChartNonHrp = d3.axisLeft(yScaleBarChartNonHrp)
			.tickSize(0);

		const yAxisBarChartNonHrpInner = d3.axisLeft(yScaleBarChartNonHrpInner)
			.tickSize(4);

		const groupYAxisBarChartMain = barChartPanel.main.append("g")
			.attr("class", "pbihrpgroupYAxisBarChartMain")
			.attr("transform", "translate(" + barChartPanel.mainAxisPadding + ",0)");

		const arrowheadMarker = svg.append("defs")
			.append("marker")
			.attr("id", "pbihrparrowHead")
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 0)
			.attr("refY", 0)
			.attr("markerWidth", 10)
			.attr("markerHeight", 10)
			.attr("orient", "auto")
			.append("path")
			.style("fill", "#222")
			.attr("d", "M0,-5L5,0L0,5");

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (localStorage.getItem("pbihrpdata") &&
			JSON.parse(localStorage.getItem("pbihrpdata")).timestamp > (currentDate.getTime() - localStorageTime)) {
			const rawData = JSON.parse(localStorage.getItem("pbihrpdata")).data;
			console.info("pbihrp: data from local storage");
			csvCallback(rawData);
		} else {
			d3.csv(dataFile).then(function(rawData) {
				try {
					localStorage.setItem("pbihrpdata", JSON.stringify({
						data: rawData,
						timestamp: currentDate.getTime()
					}));
				} catch (error) {
					console.info("D3 chart pbihrp, " + error);
				};
				console.info("pbihrp: data from API");
				csvCallback(rawData);
			});
		};

		function csvCallback(rawData) {

			removeProgressWheel();

			const completeData = processData(rawData)

			yearsArray = completeData.map(function(d) {
				return d.year;
			}).sort(function(a, b) {
				return a - b;
			});

			validateYear(selectedYearString);

			if (!lazyLoad) {
				draw(completeData);
			} else {
				d3.select(window).on("scroll.pbihrp", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbihrp", null);
					draw(completeData);
				};
			};

			//end of csvCallback
		};

		function draw(completeData) {

			const data = completeData.find(function(d) {
				return d.year === chartState.selectedYear;
			});

			resizeSVGHeight(data)

			createTitle(completeData);

			createButtonsPanel(yearsArray, completeData);

			createTopSummaryPanel(data.totalData, data.hrpYear);

			createStackedBarPanel(data.totalData);

			createDonutsPanel(data.totalData, data.hrpYear);

			createBarChartPanel(data);

			createNonHrpPanel(data);

			createSortMenu(completeData);

			if (!isPfbiSite) createFooterDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function resizeSVGHeight(data) {

			const barsHeight = data.hrpData.length * barGroupHeight;

			const nonHrpBarsHeight = data.nonHrpData.length * nonHrpBarHeight;

			barChartPanel.height = barChartPanel.padding[0] + barsHeight + barChartPanel.padding[2];

			nonHrpPanel.height = nonHrpBarsHeight ? nonHrpPanel.padding[0] + nonHrpBarsHeight + nonHrpPanel.padding[2] : 0;

			nonHrpPanel.main
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + topSummaryPanel.height + stackedBarPanel.height + donutsPanel.height + barChartPanel.height + 7 * panelVerticalPadding) + ")");

			height = padding[0] + buttonsPanel.height + topSummaryPanel.height + stackedBarPanel.height + donutsPanel.height + barChartPanel.height + nonHrpPanel.height + 7 * panelVerticalPadding + padding[2];

			if (!selectedResponsiveness) {
				containerDiv.style("width", width + "px")
					.style("height", height + "px");
			};

			if (isInternetExplorer) {
				svg.attr("viewBox", "0 0 " + width + " " + height)
					.attr("height", height);
			} else {
				svg.attr("viewBox", "0 0 " + width + " " + height);
			};

			//end of resizeSVGHeight
		};

		function createTitle(completeData) {

			const title = titleDiv.append("p")
				.attr("id", "pbihrpd3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", "pbihrpHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "pbihrpDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			const snapshotDiv = iconsDiv.append("div")
				.attr("class", "pbihrpSnapshotDiv");

			const snapshotIcon = snapshotDiv.append("button")
				.attr("id", "pbihrpSnapshotButton");

			snapshotIcon.html("IMAGE ")
				.append("span")
				.attr("class", "fas fa-camera");

			const snapshotContent = snapshotDiv.append("div")
				.attr("class", "pbihrpSnapshotContent");

			const pdfSpan = snapshotContent.append("p")
				.attr("id", "pbihrpSnapshotPdfText")
				.html("Download PDF")
				.on("click", function() {
					createSnapshot("pdf", false);
				});

			const pngSpan = snapshotContent.append("p")
				.attr("id", "pbihrpSnapshotPngText")
				.html("Download Image (PNG)")
				.on("click", function() {
					createSnapshot("png", false);
				});

			if (!isBookmarkPage) {

				const shareIcon = iconsDiv.append("button")
					.attr("id", "pbihrpShareButton");

				shareIcon.html("SHARE  ")
					.append("span")
					.attr("class", "fas fa-share");

				const shareDiv = containerDiv.append("div")
					.attr("class", "d3chartShareDiv")
					.style("display", "none");

				shareIcon.on("mouseover", function() {
						shareDiv.html("Click to copy")
							.style("display", "block");
						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv.node().getBoundingClientRect();
						const shareBox = shareDiv.node().getBoundingClientRect();
						const thisOffsetTop = thisBox.top - containerBox.top - (shareBox.height - thisBox.height) / 2;
						const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
						shareDiv.style("top", thisOffsetTop + "px")
							.style("left", thisOffsetLeft + "20px");
					}).on("mouseout", function() {
						shareDiv.style("display", "none");
					})
					.on("click", function() {

						const newURL = bookmarkSite + queryStringValues.toString();

						const shareInput = shareDiv.append("input")
							.attr("type", "text")
							.attr("readonly", true)
							.attr("spellcheck", "false")
							.property("value", newURL);

						shareInput.node().select();

						document.execCommand("copy");

						shareDiv.html("Copied!");

						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv.node().getBoundingClientRect();
						const shareBox = shareDiv.node().getBoundingClientRect();
						const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
						shareDiv.style("left", thisOffsetLeft + "20px");

					});

			};

			if (browserHasSnapshotIssues) {
				const bestVisualizedSpan = snapshotContent.append("p")
					.attr("id", "pbihrpBestVisualizedText")
					.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
					.attr("pointer-events", "none")
					.style("cursor", "default");
			};

			snapshotDiv.on("mouseover", function() {
				snapshotContent.style("display", "block")
			}).on("mouseout", function() {
				snapshotContent.style("display", "none")
			});

			helpIcon.on("click", createAnnotationsDiv);

			downloadIcon.on("click", function() {

				const data = completeData.find(function(d) {
					return d.year === chartState.selectedYear;
				});

				const csv = createCsv(data);

				const currentDate = new Date();

				const fileName = "CBPFvsHRP_" + csvDateFormat(currentDate) + ".csv";

				const blob = new Blob([csv], {
					type: 'text/csv;charset=utf-8;'
				});

				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blob, filename);
				} else {

					const link = document.createElement("a");

					if (link.download !== undefined) {

						const url = URL.createObjectURL(blob);

						link.setAttribute("href", url);
						link.setAttribute("download", fileName);
						link.style = "visibility:hidden";

						document.body.appendChild(link);

						link.click();

						document.body.removeChild(link);

					};
				};

			});

			//end of createTitle
		};

		function createButtonsPanel(yearsData, completeData) {

			const clipPathButtons = buttonsPanel.main.append("clipPath")
				.attr("id", "pbihrpclipPathButtons")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", (buttonsPanel.height - buttonsPanel.padding[2]));

			const clipPathGroup = buttonsPanel.main.append("g")
				.attr("class", "pbihrpClipPathGroup")
				.attr("transform", "translate(" + (buttonsPanel.padding[3]) + ",0)")
				.attr("clip-path", "url(#pbihrpclipPathButtons)");

			const buttonsGroup = clipPathGroup.append("g")
				.attr("class", "pbihrpbuttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const buttonsRects = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "pbihrpbuttonsRects")
				.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonPadding)
				.attr("height", (buttonsPanel.height - buttonsPanel.padding[2]) - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonPadding / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear === d ? unBlue : "#eaeaea";
				});

			const buttonsText = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "pbihrpbuttonsText")
				.style("user-select", "none")
				.attr("y", (buttonsPanel.height - buttonsPanel.padding[2]) / 1.6)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear === d ? "white" : "#444";
				})
				.text(function(d) {
					return d;
				});

			const leftArrow = buttonsPanel.main.append("g")
				.attr("class", "pbihrpLeftArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

			const leftArrowRect = leftArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", (buttonsPanel.height - buttonsPanel.padding[2]) - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding);

			const leftArrowText = leftArrow.append("text")
				.attr("class", "pbihrpleftArrowText")
				.attr("x", 0)
				.attr("y", (buttonsPanel.height - buttonsPanel.padding[2]) - buttonsPanel.buttonVerticalPadding * 2.4)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonsPanel.main.append("g")
				.attr("class", "pbihrpRightArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
					(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

			const rightArrowRect = rightArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", (buttonsPanel.height - buttonsPanel.padding[2]) - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding);

			const rightArrowText = rightArrow.append("text")
				.attr("class", "pbihrprightArrowText")
				.attr("x", -1)
				.attr("y", (buttonsPanel.height - buttonsPanel.padding[2]) - buttonsPanel.buttonVerticalPadding * 2.4)
				.style("fill", "#666")
				.text("\u25ba");

			if (yearsArray.length > buttonsNumber) {

				clipPathGroup.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")

				rightArrow.style("opacity", 1)
					.attr("pointer-events", "all");

				leftArrow.style("opacity", 1)
					.attr("pointer-events", "all");

				repositionButtonsGroup();

				checkCurrentTranslate();

				leftArrow.on("click", function() {
					leftArrow.attr("pointer-events", "none");
					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
					buttonsGroup.transition()
						.duration(duration)
						.attr("transform", "translate(" +
							Math.min(0, (currentTranslate + buttonsNumber * buttonsPanel.buttonWidth)) + ",0)")
						.on("end", function() {
							const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
							if (currentTranslate === 0) {
								leftArrow.select("text").style("fill", "#ccc")
							} else {
								leftArrow.attr("pointer-events", "all");
							}
						})
				});

				rightArrow.on("click", function() {
					rightArrow.attr("pointer-events", "none");
					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
					buttonsGroup.transition()
						.duration(duration)
						.attr("transform", "translate(" +
							Math.max(-((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth),
								(-(Math.abs(currentTranslate) + buttonsNumber * buttonsPanel.buttonWidth))) +
							",0)")
						.on("end", function() {
							const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
							if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
								rightArrow.select("text").style("fill", "#ccc")
							} else {
								rightArrow.attr("pointer-events", "all");
							}
						})
				});
			};

			buttonsRects.on("mouseover", mouseOverButtonsRects)
				.on("mouseout", mouseOutButtonsRects)
				.on("click", function(d) {
					chartState.selectedYear = d;

					if (queryStringValues.has("year")) {
						queryStringValues.set("year", d);
					} else {
						queryStringValues.append("year", d);
					};

					buttonsRects.style("fill", function(e) {
						return chartState.selectedYear === e ? unBlue : "#eaeaea";
					});

					buttonsText.style("fill", function(e) {
						return chartState.selectedYear === e ? "white" : "#444";
					});

					const data = completeData.find(function(d) {
						return d.year === chartState.selectedYear;
					});

					resizeSVGHeight(data)

					createTopSummaryPanel(data.totalData, data.hrpYear);

					createStackedBarPanel(data.totalData);

					createDonutsPanel(data.totalData, data.hrpYear);

					createBarChartPanel(data);

					createNonHrpPanel(data);
				});

			function mouseOverButtonsRects(d) {
				d3.select(this).style("fill", unBlue);
				buttonsGroup.selectAll("text")
					.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				if (chartState.selectedYear === d) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function checkCurrentTranslate() {

				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

				if (currentTranslate === 0) {
					leftArrow.select("text").style("fill", "#ccc")
					leftArrow.attr("pointer-events", "none");
				};

				if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
					rightArrow.select("text").style("fill", "#ccc")
					rightArrow.attr("pointer-events", "none");
				};

			};

			function repositionButtonsGroup() {

				const firstYearIndex = chartState.selectedYear < yearsArray[buttonsNumber / 2] ?
					0 :
					chartState.selectedYear > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
					yearsArray.length - buttonsNumber :
					yearsArray.indexOf(chartState.selectedYear) - (buttonsNumber / 2);

				buttonsGroup.attr("transform", "translate(" +
					(-(buttonsPanel.buttonWidth * firstYearIndex)) +
					",0)");

			};

			//end of createButtonsPanel
		};

		function createTopSummaryPanel(data, hrpYear) {

			const maximumTotalValue = d3.max(d3.values(data));

			topSummaryScale.domain([0, maximumTotalValue]);

			const topSummaryPanelTitle = topSummaryPanel.main.selectAll(".pbihrptopSummaryPanelTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrptopSummaryPanelTitle")
				.attr("x", 0)
				.attr("y", topSummaryPanel.titlePadding - 10)
				.text("Summary of the data");

			const topSummaryPanelLine = topSummaryPanel.main.selectAll(".pbihrptopSummaryPanelLine")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrptopSummaryPanelLine")
				.attr("x1", 0)
				.attr("x2", topSummaryPanel.width)
				.attr("y1", topSummaryPanel.titlePadding - 3)
				.attr("y2", topSummaryPanel.titlePadding - 3)
				.style("stroke-width", "2px")
				.style("stroke", colorsArray[0]);

			const topSummaryPanelMiddleLine = topSummaryPanel.main.selectAll(".pbihrptopSummaryPanelMiddleLine")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrptopSummaryPanelMiddleLine")
				.attr("x1", topSummaryPanel.width / 2)
				.attr("x2", topSummaryPanel.width / 2)
				.attr("y1", topSummaryPanel.titlePadding + 8)
				.attr("y2", topSummaryPanel.height - 8)
				.style("stroke-width", "1px")
				.style("stroke", "#ccc");

			const previousCbpfValue = d3.select(".pbihrptopSummaryPanelCbpfValue").size() !== 0 ? d3.select(".pbihrptopSummaryPanelCbpfValue").datum() : 0;

			const previousHrpValue = d3.select(".pbihrptopSummaryPanelHrpValue").size() !== 0 ? d3.select(".pbihrptopSummaryPanelHrpValue").datum() : 0;

			let topSummaryPanelCbpfValue = topSummaryPanelCbpf.main.selectAll(".pbihrptopSummaryPanelCbpfValue")
				.data([data.cbpftarget]);

			topSummaryPanelCbpfValue = topSummaryPanelCbpfValue.enter()
				.append("text")
				.attr("class", "pbihrptopSummaryPanelCbpfValue contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topSummaryPanelCbpfValue)
				.attr("y", topSummaryPanelCbpf.height - topSummaryPanelCbpf.valueVerPadding)
				.attr("x", topSummaryPanelCbpf.valuePadding);

			topSummaryPanelCbpfValue.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousCbpfValue, d);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			let topSummaryPanelCbpfTopText = topSummaryPanelCbpf.main.selectAll(".pbihrptopSummaryPanelCbpfTopText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrptopSummaryPanelCbpfTopText")
				.attr("x", topSummaryPanelCbpf.valuePadding + 3)
				.attr("y", topSummaryPanelCbpf.height - topSummaryPanelCbpf.valueVerPadding * 2.6)
				.text("CBPF Target");

			let topSummaryPanelCbpfBottomText = topSummaryPanelCbpf.main.selectAll(".pbihrptopSummaryPanelCbpfBottomText")
				.data([data.hrpfunding]);

			topSummaryPanelCbpfBottomText = topSummaryPanelCbpfBottomText.enter()
				.append("text")
				.attr("class", "pbihrptopSummaryPanelCbpfBottomText")
				.attr("x", topSummaryPanelCbpf.valuePadding + 3)
				.attr("y", topSummaryPanelCbpf.height - topSummaryPanelCbpf.valueVerPadding * 1.1)
				.merge(topSummaryPanelCbpfBottomText)
				.text(function(d) {
					return "(" + targetPercentage + " of " + formatSIFloat(d) + ")";
				});

			let topSummaryPanelHrpValue = topSummaryPanelHrp.main.selectAll(".pbihrptopSummaryPanelHrpValue")
				.data([data.hrpfunding]);

			topSummaryPanelHrpValue = topSummaryPanelHrpValue.enter()
				.append("text")
				.attr("class", "pbihrptopSummaryPanelHrpValue contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topSummaryPanelHrpValue)
				.attr("y", topSummaryPanelHrp.height - topSummaryPanelHrp.valueVerPadding)
				.attr("x", topSummaryPanelHrp.valuePadding);

			topSummaryPanelHrpValue.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousHrpValue, d);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			let topSummaryPanelHrpTopText = topSummaryPanelHrp.main.selectAll(".pbihrptopSummaryPanelHrpTopText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrptopSummaryPanelHrpTopText")
				.attr("x", topSummaryPanelHrp.valuePadding + 3)
				.attr("y", topSummaryPanelHrp.height - topSummaryPanelHrp.valueVerPadding * 2.6)
				.text("HRP Funding");

			let topSummaryPanelHrpBottomText = topSummaryPanelHrp.main.selectAll(".pbihrptopSummaryPanelHrpBottomText")
				.data([data.hrpfunding]);

			topSummaryPanelHrpBottomText = topSummaryPanelHrpBottomText.enter()
				.append("text")
				.attr("class", "pbihrptopSummaryPanelHrpBottomText")
				.attr("x", topSummaryPanelHrp.valuePadding + 3)
				.attr("y", topSummaryPanelHrp.height - topSummaryPanelHrp.valueVerPadding * 1.1)
				.merge(topSummaryPanelHrpBottomText)
				.text(function(d) {
					return "(for " + hrpYear + ")";
				});

			const cbpfTargetLabel = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfTargetLabel")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrpcbpfTargetLabel")
				.attr("x", topSummaryPanelCbpf.padding[3] - 4)
				.attr("text-anchor", "end")
				.attr("y", topSummaryPanelCbpf.height - topSummaryPanelCbpf.valueVerPadding * 2.7)
				.text("Target");

			const cbpfFundingLabel = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfFundingLabel")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrpcbpfFundingLabel")
				.attr("x", topSummaryPanelCbpf.padding[3] - 4)
				.attr("text-anchor", "end")
				.attr("y", topSummaryPanelCbpf.height - topSummaryPanelCbpf.valueVerPadding * 1.3)
				.text("Funding");

			const hrpRequirementsLabel = topSummaryPanelHrp.main.selectAll(".pbihrphrpRequirementsLabel")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrphrpRequirementsLabel")
				.attr("x", topSummaryPanelHrp.padding[3] - 4)
				.attr("text-anchor", "end")
				.attr("y", topSummaryPanelHrp.height - topSummaryPanelHrp.valueVerPadding * 2.7)
				.text("Requirements");

			const hrpFundingLabel = topSummaryPanelHrp.main.selectAll(".pbihrphrpFundingLabel")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrphrpFundingLabel")
				.attr("x", topSummaryPanelHrp.padding[3] - 4)
				.attr("text-anchor", "end")
				.attr("y", topSummaryPanelHrp.height - topSummaryPanelHrp.valueVerPadding * 1.3)
				.text("Funding");

			let cbpfTargetBar = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfTargetBar")
				.data([data.cbpftarget]);

			cbpfTargetBar = cbpfTargetBar.enter()
				.append("rect")
				.attr("class", "pbihrpcbpfTargetBar")
				.attr("x", topSummaryPanelCbpf.padding[3])
				.attr("y", topSummaryPanelCbpf.height * 0.35 - topSummaryBarsHeight / 2)
				.attr("width", 0)
				.attr("height", topSummaryBarsHeight)
				.style("fill", colorsArray[1])
				.merge(cbpfTargetBar);

			cbpfTargetBar.transition()
				.duration(duration)
				.attr("width", function(d) {
					return topSummaryScale(d) - topSummaryPanelCbpf.padding[3];
				});

			let cbpfFundingBar = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfFundingBar")
				.data([data.cbpffunding]);

			cbpfFundingBar = cbpfFundingBar.enter()
				.append("rect")
				.attr("class", "pbihrpcbpfFundingBar")
				.attr("x", topSummaryPanelCbpf.padding[3])
				.attr("y", topSummaryPanelCbpf.height * 0.65 - topSummaryBarsHeight / 2)
				.attr("width", 0)
				.attr("height", topSummaryBarsHeight)
				.style("fill", colorsArray[0])
				.merge(cbpfFundingBar);

			cbpfFundingBar.transition()
				.duration(duration)
				.attr("width", function(d) {
					return topSummaryScale(d) - topSummaryPanelCbpf.padding[3];
				});

			let hrpRequirementsBar = topSummaryPanelHrp.main.selectAll(".pbihrphrpRequirementsBar")
				.data([data.hrprequirements]);

			hrpRequirementsBar = hrpRequirementsBar.enter()
				.append("rect")
				.attr("class", "pbihrphrpRequirementsBar")
				.attr("x", topSummaryPanelHrp.padding[3])
				.attr("y", topSummaryPanelHrp.height * 0.35 - topSummaryBarsHeight / 2)
				.attr("width", 0)
				.attr("height", topSummaryBarsHeight)
				.style("fill", colorsArray[3])
				.merge(hrpRequirementsBar);

			hrpRequirementsBar.transition()
				.duration(duration)
				.attr("width", function(d) {
					return topSummaryScale(d) - topSummaryPanelHrp.padding[3];
				});

			let hrpFundingBar = topSummaryPanelHrp.main.selectAll(".pbihrphrpFundingBar")
				.data([data.hrpfunding]);

			hrpFundingBar = hrpFundingBar.enter()
				.append("rect")
				.attr("class", "pbihrphrpFundingBar")
				.attr("x", topSummaryPanelHrp.padding[3])
				.attr("y", topSummaryPanelHrp.height * 0.65 - topSummaryBarsHeight / 2)
				.attr("width", 0)
				.attr("height", topSummaryBarsHeight)
				.style("fill", colorsArray[2])
				.merge(hrpFundingBar);

			hrpFundingBar.transition()
				.duration(duration)
				.attr("width", function(d) {
					return topSummaryScale(d) - topSummaryPanelHrp.padding[3];
				});

			const cbpfTargetBarTick = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfTargetBarTick")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrpcbpfTargetBarTick")
				.attr("x1", topSummaryPanelCbpf.padding[3] - 3)
				.attr("x2", topSummaryPanelCbpf.padding[3])
				.attr("y1", topSummaryPanelCbpf.height * 0.35)
				.attr("y2", topSummaryPanelCbpf.height * 0.35)
				.style("stroke", "#888")
				.style("stroke-width", "1px");

			const cbpfFundingBarTick = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfFundingBarTick")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrpcbpfFundingBarTick")
				.attr("x1", topSummaryPanelCbpf.padding[3] - 3)
				.attr("x2", topSummaryPanelCbpf.padding[3])
				.attr("y1", topSummaryPanelCbpf.height * 0.65)
				.attr("y2", topSummaryPanelCbpf.height * 0.65)
				.style("stroke", "#888")
				.style("stroke-width", "1px");

			const hrpRequirementsBarTick = topSummaryPanelHrp.main.selectAll(".pbihrphrpRequirementsBarTick")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrphrpRequirementsBarTick")
				.attr("x1", topSummaryPanelHrp.padding[3] - 3)
				.attr("x2", topSummaryPanelHrp.padding[3])
				.attr("y1", topSummaryPanelHrp.height * 0.35)
				.attr("y2", topSummaryPanelHrp.height * 0.35)
				.style("stroke", "#888")
				.style("stroke-width", "1px");

			const hrpFundingBarTick = topSummaryPanelHrp.main.selectAll(".pbihrphrpFundingBarTick")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrphrpFundingBarTick")
				.attr("x1", topSummaryPanelHrp.padding[3] - 3)
				.attr("x2", topSummaryPanelHrp.padding[3])
				.attr("y1", topSummaryPanelHrp.height * 0.65)
				.attr("y2", topSummaryPanelHrp.height * 0.65)
				.style("stroke", "#888")
				.style("stroke-width", "1px");

			let cbpfTargetBarValue = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfTargetBarValue")
				.data([data.cbpftarget]);

			cbpfTargetBarValue = cbpfTargetBarValue.enter()
				.append("text")
				.attr("class", "pbihrpcbpfTargetBarValue")
				.attr("y", topSummaryPanelCbpf.height - topSummaryPanelCbpf.valueVerPadding * 2.7)
				.attr("x", topSummaryScale(0) + 2)
				.text(formatSIFloat(0))
				.merge(cbpfTargetBarValue);

			cbpfTargetBarValue.transition()
				.duration(duration)
				.attr("x", function(d) {
					return topSummaryScale(d) + 2;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.slice(1)), d);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			let cbpfFundingBarValue = topSummaryPanelCbpf.main.selectAll(".pbihrpcbpfFundingBarValue")
				.data([data.cbpffunding]);

			cbpfFundingBarValue = cbpfFundingBarValue.enter()
				.append("text")
				.attr("class", "pbihrpcbpfFundingBarValue")
				.attr("y", topSummaryPanelCbpf.height - topSummaryPanelCbpf.valueVerPadding * 1.3)
				.attr("x", topSummaryScale(0) + 2)
				.text(formatSIFloat(0))
				.merge(cbpfFundingBarValue);

			cbpfFundingBarValue.transition()
				.duration(duration)
				.attr("x", function(d) {
					return topSummaryScale(d) + 2;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.slice(1)), d);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			let hrpRequirementsBarValue = topSummaryPanelHrp.main.selectAll(".pbihrphrpRequirementsBarValue")
				.data([data.hrprequirements]);

			hrpRequirementsBarValue = hrpRequirementsBarValue.enter()
				.append("text")
				.attr("class", "pbihrphrpRequirementsBarValue")
				.attr("y", topSummaryPanelHrp.height - topSummaryPanelHrp.valueVerPadding * 2.7)
				.attr("x", topSummaryScale(0) + 2)
				.text(formatSIFloat(0))
				.merge(hrpRequirementsBarValue);

			hrpRequirementsBarValue.transition()
				.duration(duration)
				.attr("x", function(d) {
					return topSummaryScale(d) + 2;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.slice(1)), d);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			let hrpFundingBarValue = topSummaryPanelHrp.main.selectAll(".pbihrphrpFundingBarValue")
				.data([data.hrpfunding]);

			hrpFundingBarValue = hrpFundingBarValue.enter()
				.append("text")
				.attr("class", "pbihrphrpFundingBarValue")
				.attr("y", topSummaryPanelHrp.height - topSummaryPanelHrp.valueVerPadding * 1.3)
				.attr("x", topSummaryScale(0) + 2)
				.text(formatSIFloat(0))
				.merge(hrpFundingBarValue);

			hrpFundingBarValue.transition()
				.duration(duration)
				.attr("x", function(d) {
					return topSummaryScale(d) + 2;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.slice(1)), d);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			//end of createTopSummaryPanel
		};

		function createStackedBarPanel(data) {

			const stackedBarPanelText = stackedBarPanel.main.selectAll(".pbihrpstackedBarPanelText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrpstackedBarPanelText")
				.attr("x", 0)
				.attr("y", stackedBarPanel.padding[0] - 5)
				.text("CBPF and HRP values, to scale:");

			const stackedData = d3.entries(data).sort(function(a, b) {
				return b.value - a.value;
			});

			stackedBarScale.domain([0, stackedData[0].value]);

			let stackedBarsGroup = stackedBarPanel.main.selectAll(".pbihrpstackedBarsGroup")
				.data(stackedData, function(d) {
					return d.key;
				});

			const stackedBarsGroupEnter = stackedBarsGroup.enter()
				.append("g")
				.attr("class", "pbihrpstackedBarsGroup");

			const stackedBarsEnter = stackedBarsGroupEnter.append("rect")
				.attr("y", function(_, i) {
					return stackedBarPanel.padding[0] + i * (stackedBarHeight / 2);
				})
				.attr("x", stackedBarScale(0))
				.attr("height", stackedBarHeight)
				.style("fill", function(d) {
					return colorsScale(d.key);
				})
				.style("stroke", "white")
				.style("stroke-width", "1px");

			const stackedBarsLabels = stackedBarsGroupEnter.append("text")
				.attr("class", "pbihrpstackedBarsLabels")
				.attr("x", stackedBarScale(0))
				.attr("y", stackedBarPanel.height - stackedBarPanel.padding[2] + stackedBarPanel.labelPadding)
				.attr("font-family", "Roboto")
				.attr("font-size", "12px")
				.attr("font-weight", 500)
				.text(formatSIFloat(0));

			const stackedBarsLabelsSpan = stackedBarsGroupEnter.append("text")
				.attr("class", "pbihrpstackedBarsLabelsSpan")
				.attr("font-family", "Roboto")
				.attr("font-size", "12px")
				.attr("font-weight", 400)
				.attr("x", stackedBarScale(0))
				.attr("y", stackedBarPanel.height - stackedBarPanel.padding[2] + stackedBarPanel.labelPadding * 2.3)
				.text(function(d) {
					return sortByValues[d.key];
				});

			const stackedBarsPolyline = stackedBarsGroupEnter.append("polyline")
				.style("fill", "none")
				.style("stroke", "#ccc")
				.style("stroke-width", "1px")
				.attr("points", function(d, i) {
					return stackedBarScale(0) + "," + (stackedBarPanel.padding[0] + (i * stackedBarHeight / 2) + stackedBarHeight) + " " +
						stackedBarScale(0) + "," + (stackedBarPanel.height - stackedBarPanel.padding[2] - 4) + " " +
						stackedBarScale(0) + "," + (stackedBarPanel.height - stackedBarPanel.padding[2] - 4) + " " +
						stackedBarScale(0) + "," + (stackedBarPanel.height - stackedBarPanel.padding[2]) + " ";
				});

			stackedBarsLabelsSpan.each(function(_, i, n) {
				if (!i) {
					d3.select(this.parentNode).selectAll("text, tspan")
						.attr("text-anchor", "end");
				};
				localVariable.set(this.parentNode, this.getBoundingClientRect().width);
			});

			stackedBarsGroup = stackedBarsGroupEnter.merge(stackedBarsGroup);

			let labelsPositions = [];

			stackedBarsGroup.each(function(d) {
				const thisWidth = localVariable.get(this);
				labelsPositions.unshift({
					key: d.key,
					position: stackedBarScale(d.value),
					width: thisWidth
				});
			});

			labelsPositions.forEach(function(d, i, arr) {
				if (i && i < arr.length - 1) {
					if (d.position < arr[i - 1].position) d.position = arr[i - 1].position;
					while (d.position < arr[i - 1].position + arr[i - 1].width + stackedBarPanel.labelHorPadding) {
						++d.position;
					};
				};
			});

			for (let i = labelsPositions.length - 1; i--;) {
				if (labelsPositions[i].position > labelsPositions[i + 1].position) labelsPositions[i].position = labelsPositions[i + 1].position;
				if (i === labelsPositions.length - 2) {
					while (labelsPositions[i].position + labelsPositions[i].width + stackedBarPanel.labelHorPadding > labelsPositions[i + 1].position - labelsPositions[i + 1].width) {
						--labelsPositions[i].position;
					};
				} else {
					while (labelsPositions[i].position + labelsPositions[i].width + stackedBarPanel.labelHorPadding > labelsPositions[i + 1].position) {
						--labelsPositions[i].position;
					};
				};
			};

			stackedBarsGroup.select("rect")
				.transition()
				.duration(duration)
				.attr("y", function(_, i) {
					return stackedBarPanel.padding[0] + i * (stackedBarHeight / 2);
				})
				.attr("width", function(d) {
					return stackedBarScale(d.value) - stackedBarPanel.padding[3]
				});

			stackedBarsGroup.select("text.pbihrpstackedBarsLabels")
				.transition()
				.duration(duration)
				.attr("x", function(d, i, n) {
					return labelsPositions.find(function(e) {
						return e.key === d.key;
					}).position;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.slice(1)), d.value);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			stackedBarsGroup.select("text.pbihrpstackedBarsLabelsSpan")
				.transition()
				.duration(duration)
				.attr("x", function(d, i, n) {
					return labelsPositions.find(function(e) {
						return e.key === d.key;
					}).position;
				});

			stackedBarsGroup.select("polyline")
				.transition()
				.duration(duration)
				.attr("points", function(d, i) {
					const lastPoint = labelsPositions.find(function(e) {
						return e.key === d.key;
					}).position;
					return stackedBarScale(d.value) + "," + (stackedBarPanel.padding[0] + (i * stackedBarHeight / 2) + stackedBarHeight) + " " +
						stackedBarScale(d.value) + "," + (stackedBarPanel.height - stackedBarPanel.padding[2] - 4) + " " +
						lastPoint + "," + (stackedBarPanel.height - stackedBarPanel.padding[2] - 4) + " " +
						lastPoint + "," + (stackedBarPanel.height - stackedBarPanel.padding[2]) + " ";
				});

			//end of createStackedBarPanel
		};

		function createDonutsPanel(data, hrpYear) {

			const previousFundingValue = d3.select(".pbihrpdonutsPanelFundingValue").size() !== 0 ? d3.select(".pbihrpdonutsPanelFundingValue").datum() : 0;

			let donutsPanelFundingValue = donutsPanel.main.selectAll(".pbihrpdonutsPanelFundingValue")
				.data([data.cbpffunding]);

			donutsPanelFundingValue = donutsPanelFundingValue.enter()
				.append("text")
				.attr("class", "pbihrpdonutsPanelFundingValue contributionColorFill")
				.attr("text-anchor", "end")
				.merge(donutsPanelFundingValue)
				.attr("y", donutsPanel.height - donutsPanel.valueVerPadding)
				.attr("x", donutsPanel.valuePadding);

			donutsPanelFundingValue.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousFundingValue, d);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t));
					};
				});

			const donutsPanelTopText = donutsPanel.main.selectAll(".pbihrpdonutsPanelTopText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrpdonutsPanelTopText")
				.attr("x", donutsPanel.valuePadding + 3)
				.attr("y", donutsPanel.height - donutsPanel.valueVerPadding * 2.6)
				.text("Is the CBPF current")
				.append("tspan")
				.attr("x", donutsPanel.valuePadding + 3)
				.attr("y", donutsPanel.height - donutsPanel.valueVerPadding * 1.1)
				.text("funding. It corresponds to...");

			const donutsPanelArrow = donutsPanel.main.selectAll(".pbihrpdonutsPanelArrow")
				.data([true])
				.enter()
				.append("text")
				.attr("font-size", "40px")
				.attr("fill", "#888")
				.attr("font-family", "Arial")
				.attr("class", "pbihrpdonutsPanelArrow")
				.attr("y", donutsPanel.height / 1.3)
				.attr("x", donutsPanel.valuePadding + 190)
				.text("\u2192");

			const donutsKeys = ["cbpftarget", "hrpfunding", "hrprequirements"];

			donutsPanelScale.domain(donutsKeys);

			const pieData = donutsKeys.map(function(d) {
				const values = [{
					key: "cbpffunding",
					value: data.cbpffunding
				}, {
					key: d,
					value: data[d] - data.cbpffunding
				}];
				return {
					key: d,
					percent: data.cbpffunding / data[d],
					values: values
				};
			});

			let donutsGroup = donutsPanel.main.selectAll(".pbihrpdonutsGroup")
				.data(pieData);

			const donutsGroupEnter = donutsGroup.enter()
				.append("g")
				.attr("class", "pbihrpdonutsGroup")
				.attr("transform", function(d) {
					return "translate(" + donutsPanelScale(d.key) + "," + ((donutsPanel.padding[0] + donutsPanel.height) / 2) + ")";
				});

			const donutsPathsEnter = donutsGroupEnter.selectAll(null)
				.data(function(d) {
					return donutGenerator(d.values.map(function(e) {
						if (e.key === "cbpffunding") {
							return {
								key: "cbpffunding",
								value: 0
							};
						} else {
							return e;
						}
					}))
				}, function(d) {
					return d.data.key;
				})
				.enter()
				.append("path")
				.attr("class", "pbihrpdonutsPaths")
				.style("fill", function(d) {
					return d.data.key === "cbpffunding" ? colorsArray[0] : colorsArray[colorsArray.length - 1];
				})
				.attr("d", arcGenerator)
				.each(function(d) {
					localVariable.set(this, d);
				});

			const donutsPercentage = donutsGroupEnter.append("text")
				.attr("class", "pbihrpdonutsPercentage")
				.attr("text-anchor", "middle")
				.attr("y", 4)
				.attr("x", 0)
				.text(formatPercent(0));

			const donutsPanelDonutsText = donutsGroupEnter.selectAll(null)
				.data(function(d) {
					return [d]
				})
				.enter()
				.append("text")
				.attr("class", "pbihrpdonutsPanelDonutsText")
				.attr("x", donutsPanel.height / 2)
				.attr("y", -3)
				.text(function(d) {
					if (d.key === "cbpftarget") {
						return "of the current CBPF";
					} else if (d.key === "hrpfunding") {
						return "of the HRP Funding";
					} else {
						return "of the HRP Requirements"
					};
				})
				.append("tspan")
				.attr("x", donutsPanel.height / 2)
				.attr("y", 12)
				.text(function(d) {
					if (d.key === "cbpftarget") {
						return "Target";
					} else {
						return "for " + hrpYear;
					};
				});

			donutsGroup = donutsGroupEnter.merge(donutsGroup);

			donutsGroup.select(".pbihrpdonutsPercentage")
				.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const thisValue = +(node.textContent.match(/\d+/)[0]);
					const i = d3.interpolate(thisValue / 100, d.percent);
					return function(t) {
						node.textContent = formatPercent(i(t));
					};
				});

			donutsGroup.select(".pbihrpdonutsPanelDonutsText tspan")
				.text(function(d) {
					if (d.key === "cbpftarget") {
						return "Target";
					} else {
						return "for " + hrpYear;
					};
				});

			const donutsPaths = donutsGroup.selectAll(".pbihrpdonutsPaths")
				.data(function(d) {
					return donutGenerator(d.values)
				}, function(d) {
					return d.data.key;
				})
				.transition()
				.duration(duration)
				.attrTween("d", function(d) {
					const i = d3.interpolate(localVariable.get(this), d);
					localVariable.set(this, i(0));
					return function(t) {
						return arcGenerator(i(t));
					};
				});

			//end of createDonutsPanel
		};

		function createBarChartPanel(data) {

			const barChartPanelTitle = barChartPanel.main.selectAll(".pbihrpbarChartPanelTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrpbarChartPanelTitle")
				.attr("x", 0)
				.attr("y", barChartPanel.titlePadding - 7)
				.text("CBPF Target by Country");

			const barChartPanelLine = barChartPanel.main.selectAll(".pbihrpbarChartPanelLine")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrpbarChartPanelLine")
				.attr("x1", 0)
				.attr("x2", barChartPanel.width)
				.attr("y1", barChartPanel.titlePadding)
				.attr("y2", barChartPanel.titlePadding)
				.style("stroke-width", "2px")
				.style("stroke", colorsArray[0]);

			const legendGroup = barChartPanel.main.selectAll(".pbihrplegendGroup")
				.data(variablesArray.filter(function(_, i) {
					return i !== 1;
				}))
				.enter()
				.append("g")
				.attr("class", "pbihrplegendGroup")
				.attr("transform", "translate(0," + barChartPanel.legendPadding + ")");

			const legendRectangle = legendGroup.append("rect")
				.attr("width", legendRectangleSize)
				.attr("height", legendRectangleSize)
				.style("fill", function(d) {
					return colorsScale(d)
				});

			const legendText = legendGroup.append("text")
				.attr("y", legendRectangleSize - 3)
				.attr("x", legendRectangleSize + 3)
				.attr("class", "pbihrplegendText")
				.style("font-family", "Roboto")
				.style("font-size", "13px")
				.text(function(d) {
					return sortByValues[d.toLowerCase()];
				});

			if (legendGroup.size()) {
				let counter = 0;
				legendGroup.each(function(_, i, nodes) {
					if (i) {
						d3.select(this)
							.attr("transform", "translate(" + (counter += this.previousSibling.getBoundingClientRect().width + 26) + "," + barChartPanel.legendPadding + ")");
					};
				});

				counter += legendGroup.nodes()[legendGroup.nodes().length - 1].getBoundingClientRect().width + 34;

				const legendRadius = 8,
					legendData = [{
						value: 0.7
					}, {
						value: 0.3
					}],
					legendArc = d3.arc().outerRadius(legendRadius + 1).innerRadius(legendRadius - 2);
				const legendDonutGroup = barChartPanel.main.append("g")
					.attr("transform", "translate(" + counter + "," + (barChartPanel.legendPadding + 8) + ")");
				const legendPie = legendDonutGroup.selectAll(null)
					.data(donutGenerator(legendData))
					.enter()
					.append("path")
					.attr("d", legendArc)
					.style("fill", function(_, i) {
						return i ? colorsArray[3] : colorsArray[0];
					});

				const legendDonutText = legendDonutGroup.append("text")
					.attr("class", "pbihrplegendDonutText")
					.attr("text-anchor", "middle")
					.attr("y", 4)
					.text("%");

				const legendDonutTextDescription = legendDonutGroup.append("text")
					.attr("y", 5)
					.attr("x", legendRadius + 3)
					.attr("class", "pbihrplegendText")
					.style("font-family", "Roboto")
					.style("font-size", "13px")
					.text("CBPF Funding as Percentage of the Target");

			};

			data.hrpData.sort(function(a, b) {
				if (chartState.sortBy === "alphabetically") {
					return a.cbpfName.toLowerCase() < b.cbpfName.toLowerCase() ? -1 :
						a.cbpfName.toLowerCase() > b.cbpfName.toLowerCase() ? 1 : 0;
				} else {
					return b[chartState.sortBy] - a[chartState.sortBy] ||
						(a.cbpfName.toLowerCase() < b.cbpfName.toLowerCase() ? -1 :
							a.cbpfName.toLowerCase() > b.cbpfName.toLowerCase() ? 1 : 0);
				};
			});

			const cbpfNames = data.hrpData.map(function(d) {
				return d.cbpfName;
			});

			yScaleBarChartMain.domain(cbpfNames)
				.range([barChartPanel.padding[0], barChartPanel.height - barChartPanel.padding[2]]);

			xScaleBarChart.domain([0, d3.max(data.hrpData, function(d) {
				return Math.max(d.cbpffunding, d.hrpfunding, d.hrprequirements);
			})]);

			let barChartGroup = barChartPanel.main.selectAll(".pbihrpbarChartGroup")
				.data(data.hrpData, function(d) {
					return d.cbpfId;
				});

			const barChartGroupExit = barChartGroup.exit()
				.remove();

			const barChartGroupEnter = barChartGroup.enter()
				.append("g")
				.attr("class", "pbihrpbarChartGroup")
				.attr("transform", function(d) {
					return "translate(0," + yScaleBarChartMain(d.cbpfName) + ")";
				});

			const barChartDonutsGroupEnter = barChartGroupEnter.append("g")
				.attr("transform", "translate(" + (barChartPanel.mainAxisPadding + barChartPanel.donutPadding) + "," + (barGroupHeight / 2) + ")");

			const barChartDonutsPathsEnter = barChartDonutsGroupEnter.selectAll(null)
				.data(donutGenerator([{
					value: 0
				}, {
					value: 1
				}]))
				.enter()
				.append("path")
				.attr("class", "pbihrpbarChartDonutsPaths")
				.attr("d", arcGenerator)
				.style("fill", function(_, i) {
					return i ? colorsArray[3] : colorsArray[0]
				})
				.each(function(d) {
					localVariable.set(this, d);
				});

			const barChartDonutsPercentageEnter = barChartDonutsGroupEnter.append("text")
				.attr("class", "pbihrpbarChartDonutsPercentage")
				.attr("text-anchor", "middle")
				.attr("y", 4)
				.attr("x", 0)
				.text(formatPercent(0));

			const groupYAxisBarChartInner = barChartGroupEnter.append("g")
				.attr("class", "pbihrpgroupYAxisBarChartInner")
				.attr("transform", "translate(" + barChartPanel.padding[3] + ",0)")
				.call(yAxisBarChartInner)
				.select(".domain")
				.remove();

			const barChartBarsEnter = barChartGroupEnter.selectAll(null)
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: 0
					}, {
						key: "hrpfunding",
						value: 0
					}, {
						key: "hrprequirements",
						value: 0
					}];
				}, function(d) {
					return d.key;
				})
				.enter()
				.append("rect")
				.attr("class", "pbihrpbarChartBars")
				.style("fill", function(d) {
					return colorsScale(d.key);
				})
				.attr("width", 0)
				.attr("height", yScaleBarChartInner.bandwidth())
				.attr("x", barChartPanel.padding[3])
				.attr("y", function(d) {
					return d.key === "cbpffunding" ? yScaleBarChartInner("CBPF") : yScaleBarChartInner("HRP")
				});

			const barChartLineEnter = barChartGroupEnter.append("line")
				.attr("class", "pbihrpbarChartLine")
				.attr("x1", xScaleBarChart(0))
				.attr("x2", xScaleBarChart(0))
				.attr("y1", yScaleBarChartInner.paddingOuter() * yScaleBarChartInner.step() / 4)
				.attr("y2", yScaleBarChartMain.bandwidth() - (yScaleBarChartInner.paddingOuter() * yScaleBarChartInner.step()) / 1.5)
				.style("stroke", "#222")
				.attr("stroke-dasharray", "2, 2")
				.attr("stroke-width", "1px")
				.attr("marker-start", "url(#pbihrparrowHead)");

			const barChartPercentageText = barChartGroupEnter.append("text")
				.attr("class", "pbihrpbarChartPercentageText")
				.attr("y", barChartPercentageLabelVertPadding)
				.attr("x", xScaleBarChart(0) + barChartPercentageLabelPadding)
				.text(targetPercentage);

			const barChartLabelsBackEnter = barChartGroupEnter.selectAll(null)
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: 0
					}];
				})
				.enter()
				.append("text")
				.attr("class", "pbihrpbarChartsLabelsBack")
				.attr("x", barChartPanel.padding[3] + barChartLabelPadding)
				.attr("y", yScaleBarChartInner("CBPF") + barChartLabelVertPadding)
				.text(formatSIFloat(0));

			const barChartLabelsEnter = barChartGroupEnter.selectAll(null)
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: 0
					}, {
						key: "hrpfunding",
						value: 0
					}, {
						key: "hrprequirements",
						value: 0
					}];
				}, function(d) {
					return d.key;
				})
				.enter()
				.append("text")
				.attr("class", "pbihrpbarChartsLabels")
				.attr("x", barChartPanel.padding[3] + barChartLabelPadding)
				.attr("y", function(d) {
					return (d.key === "cbpffunding" ? yScaleBarChartInner("CBPF") : yScaleBarChartInner("HRP")) + barChartLabelVertPadding;
				})
				.text(formatSIFloat(0));

			barChartGroup = barChartGroupEnter.merge(barChartGroup);

			barChartGroup.transition()
				.duration(duration)
				.attr("transform", function(d) {
					return "translate(0," + yScaleBarChartMain(d.cbpfName) + ")";
				});

			barChartGroup.selectAll(".pbihrpbarChartDonutsPaths")
				.data(function(d) {
					return donutGenerator([{
						value: d.cbpfpercentage
					}, {
						value: d.cbpfpercentage > 1 ? 0 : 1 - d.cbpfpercentage
					}])
				})
				.transition()
				.duration(duration)
				.attrTween("d", function(d) {
					const i = d3.interpolate(localVariable.get(this), d);
					localVariable.set(this, i(0));
					return function(t) {
						return arcGenerator(i(t));
					};
				});

			barChartGroup.select(".pbihrpbarChartDonutsPercentage")
				.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const thisValue = +(node.textContent.match(/\d+/)[0]);
					const i = d3.interpolate(thisValue / 100, d.cbpfpercentage);
					return function(t) {
						node.textContent = formatPercent(i(t));
					};
				});

			barChartGroup.selectAll(".pbihrpbarChartBars")
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: d.cbpffunding
					}, {
						key: "hrpfunding",
						value: d.hrpfunding
					}, {
						key: "hrprequirements",
						value: d.hrprequirements
					}];
				}, function(d) {
					return d.key;
				})
				.sort(function(a, b) {
					return b.value - a.value;
				})
				.transition()
				.duration(duration)
				.attr("width", function(d) {
					return xScaleBarChart(d.value) - barChartPanel.padding[3];
				});

			barChartGroup.select(".pbihrpbarChartLine")
				.transition()
				.duration(duration)
				.attr("x1", function(d) {
					return xScaleBarChart(d.cbpftarget);
				})
				.attr("x2", function(d) {
					return xScaleBarChart(d.cbpftarget);
				});

			barChartGroup.select(".pbihrpbarChartPercentageText")
				.text(function(d) {
					return targetPercentage + " of " + formatSIFloat(d.hrpfunding) + " target: ";
				})
				.append("tspan")
				.attr("class", "pbihrpbarChartPercentageTextSpan")
				.text(function(d) {
					return formatSIFloat(d.cbpftarget)
				});

			barChartGroup.select(".pbihrpbarChartPercentageText")
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					return xScaleBarChart(d.cbpftarget) + barChartPercentageLabelPadding;
				});

			barChartGroup.selectAll(".pbihrpbarChartsLabels")
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: d.cbpffunding
					}, {
						key: "hrpfunding",
						value: d.hrpfunding
					}, {
						key: "hrprequirements",
						value: d.hrprequirements
					}];
				}, function(d) {
					return d.key;
				})
				.each(function(d, _, n) {
					if (d.key === "hrpfunding") {
						const requirementsDatum = d3.select(this.nextSibling).datum();
						const dummyText = barChartGroup.append("text")
							.style("opacity", 0)
							.style("font-family", "Roboto")
							.style("font-size", 10)
							.style("font-weight", 500)
							.text(formatSIFloat(d.value));
						const size = dummyText.node().getBoundingClientRect().width;
						const move = Math.abs(xScaleBarChart(d.value) - xScaleBarChart(requirementsDatum.value)) < size + 1.5 * barChartLabelPadding;
						localVariable.set(this, {
							size: size,
							move: move
						});
						dummyText.remove();
					};
				})
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					if (d.key === "hrprequirements" && localVariable.get(this.previousSibling).move) {
						return xScaleBarChart(d.value) + (2.5 * barChartLabelPadding) + localVariable.get(this.previousSibling).size;
					} else if (d.key === "hrpfunding" && localVariable.get(this).move) {
						return xScaleBarChart(d3.select(this.nextSibling).datum().value) + barChartLabelPadding;
					} else {
						return xScaleBarChart(d.value) + barChartLabelPadding;
					};
				})
				.tween("text", function(d) {
					const separator = d.key === "hrpfunding" && localVariable.get(this).move ? "/" : "";
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.replace("/", "")), d.value);
					return function(t) {
						node.textContent = formatSIFloat(i(t)) + separator;
					};
				});

			barChartGroup.selectAll(".pbihrpbarChartsLabelsBack")
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: d.cbpffunding
					}];
				})
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					return xScaleBarChart(d.value) + barChartLabelPadding;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent), d.value);
					return function(t) {
						node.textContent = formatSIFloat(i(t));
					};
				});

			groupYAxisBarChartMain.transition()
				.duration(duration)
				.call(customAxis);

			function customAxis(group) {
				const sel = group.selection ? group.selection() : group;
				group.call(yAxisBarChartMain);
				sel.select(".domain").remove();
				sel.selectAll(".tick text")
					.filter(function(d) {
						return d === "Syria Cross border";
					})
					.text("Syria Cross")
					.attr("x", -9)
					.attr("dy", "-0.4em")
					.append("tspan")
					.attr("dy", "1.2em")
					.attr("x", -9)
					.text("border");
				if (sel !== group) group.selectAll(".tick text")
					.filter(function(d) {
						return d === "Syria Cross border";
					})
					.attrTween("x", null)
					.tween("text", null);
			};

			//end of createBarChartPanel
		};

		function createNonHrpPanel(data) {

			if (!data.nonHrpData.length) {
				nonHrpPanel.main.selectAll("*").remove();
				return;
			};

			const nonHrpPanelTitle = nonHrpPanel.main.selectAll(".pbihrpnonHrpPanelTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbihrpnonHrpPanelTitle")
				.attr("x", 0)
				.attr("y", nonHrpPanel.padding[0] - 7)
				.text("Non-HRP CBPFs:");

			const nonHrpPanelLine = nonHrpPanel.main.selectAll(".pbihrpnonHrpPanelLine")
				.data([true])
				.enter()
				.append("line")
				.attr("class", "pbihrpnonHrpPanelLine")
				.attr("x1", 0)
				.attr("x2", nonHrpPanel.width)
				.attr("y1", nonHrpPanel.padding[0] - 2)
				.attr("y2", nonHrpPanel.padding[0] - 2)
				.style("opacity", 0.5)
				.style("stroke-width", "1px")
				.style("stroke", colorsArray[0]);

			data.nonHrpData.sort(function(a, b) {
				if (chartState.sortBy === "alphabetically") {
					return a.cbpfName.toLowerCase() < b.cbpfName.toLowerCase() ? -1 :
						a.cbpfName.toLowerCase() > b.cbpfName.toLowerCase() ? 1 : 0;
				} else {
					return b.cbpffunding - a.cbpffunding ||
						(a.cbpfName.toLowerCase() < b.cbpfName.toLowerCase() ? -1 :
							a.cbpfName.toLowerCase() > b.cbpfName.toLowerCase() ? 1 : 0);
				};
			});

			const nonHrpCbpfNames = data.nonHrpData.map(function(d) {
				return d.cbpfName;
			});

			yScaleBarChartNonHrp.domain(nonHrpCbpfNames)
				.range([nonHrpPanel.padding[0], nonHrpPanel.height - nonHrpPanel.padding[2]]);

			xScaleBarChartNonHrp.domain(xScaleBarChart.domain());

			const groupYAxisBarChartNonHrp = nonHrpPanel.main.selectAll(".pbihrpgroupYAxisBarChartNonHrp")
				.data([true])
				.enter()
				.append("g")
				.attr("class", "pbihrpgroupYAxisBarChartNonHrp")
				.attr("transform", "translate(" + nonHrpPanel.mainAxisPadding + ",0)");

			nonHrpPanel.main.select(".pbihrpgroupYAxisBarChartNonHrp")
				.transition()
				.duration(duration)
				.call(yAxisBarChartNonHrp)
				.selection()
				.select(".domain")
				.remove();

			let barChartGroupNonHrp = nonHrpPanel.main.selectAll(".pbihrpbarChartGroupNonHrp")
				.data(data.nonHrpData, function(d) {
					return d.cbpfId;
				});

			const barChartGroupNonHrpExit = barChartGroupNonHrp.exit()
				.remove();

			const barChartGroupNonHrpEnter = barChartGroupNonHrp.enter()
				.append("g")
				.attr("class", "pbihrpbarChartGroupNonHrp")
				.attr("transform", function(d) {
					return "translate(0," + yScaleBarChartNonHrp(d.cbpfName) + ")";
				});

			const groupYAxisBarChartNonHrpInner = barChartGroupNonHrpEnter.append("g")
				.attr("class", "pbihrpgroupYAxisBarChartNonHrpInner")
				.attr("transform", "translate(" + nonHrpPanel.padding[3] + ",0)")
				.call(yAxisBarChartNonHrpInner)
				.select(".domain")
				.remove();

			const barChartBarsNonHrpEnter = barChartGroupNonHrpEnter.selectAll(null)
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: 0
					}];
				})
				.enter()
				.append("rect")
				.attr("class", "pbihrpbarChartBarsNonHrp")
				.style("fill", function(d) {
					return colorsScale(d.key);
				})
				.attr("width", 0)
				.attr("height", yScaleBarChartNonHrpInner.bandwidth())
				.attr("x", nonHrpPanel.padding[3])
				.attr("y", yScaleBarChartNonHrpInner("CBPF"));

			const barChartLabelsNonHrpEnter = barChartGroupNonHrpEnter.selectAll(null)
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: 0
					}];
				})
				.enter()
				.append("text")
				.attr("class", "pbihrpbarChartsLabelsNonHrp")
				.attr("x", nonHrpPanel.padding[3] + barChartLabelPadding)
				.attr("y", yScaleBarChartNonHrpInner("CBPF") + barChartLabelVertPadding)
				.text(formatSIFloat(0));

			barChartGroupNonHrp = barChartGroupNonHrpEnter.merge(barChartGroupNonHrp);

			barChartGroupNonHrp.transition()
				.duration(duration)
				.attr("transform", function(d) {
					return "translate(0," + yScaleBarChartNonHrp(d.cbpfName) + ")";
				});

			barChartGroupNonHrp.selectAll(".pbihrpbarChartBarsNonHrp")
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: d.cbpffunding
					}];
				})
				.transition()
				.duration(duration)
				.attr("width", function(d) {
					return xScaleBarChartNonHrp(d.value) - nonHrpPanel.padding[3];
				});

			barChartGroupNonHrp.selectAll(".pbihrpbarChartsLabelsNonHrp")
				.data(function(d) {
					return [{
						key: "cbpffunding",
						value: d.cbpffunding
					}];
				})
				.transition()
				.duration(duration)
				.attr("x", function(d) {
					return xScaleBarChartNonHrp(d.value) + barChartLabelPadding;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent), d.value);
					return function(t) {
						node.textContent = formatSIFloat(i(t));
					};
				});

			//end of createNonHrpPanel
		};

		function createSortMenu(completeData) {

			const sortMenuTitle = sortMenuPanel.main.append("text")
				.attr("class", "pbihrpsortMenuTitle contributionColorDarkerFill")
				.attr("x", 0)
				.attr("y", legendRectangleSize - 3)
				.text("Sort by:");

			const menuRectangle = sortMenuPanel.main.append("rect")
				.attr("rx", 2)
				.attr("ry", 2)
				.attr("x", sortMenuPanel.titlePadding)
				.attr("y", -2)
				.attr("width", sortMenuPanel.width)
				.attr("height", sortMenuPanel.groupHeight)
				.style("fill", "whitesmoke")
				.style("stroke-width", 1)
				.style("opacity", 0)
				.style("stroke", "#aaa")
				.attr("pointer-events", "none");

			const menuRectangleClip = sortMenuPanel.main.append("clipPath")
				.attr("id", "pbihrpsortMenuClip")
				.append("rect")
				.attr("x", sortMenuPanel.titlePadding + 1)
				.attr("y", -2)
				.attr("width", sortMenuPanel.width)
				.attr("height", sortMenuPanel.groupHeight);

			const sortByArrayFiltered = sortByArray.filter(function(d) {
				return d !== "cbpftarget"
			});

			let currentTranslate = calculateTranslate();

			const sortMenuContainerClipGroup = sortMenuPanel.main.append("g")
				.attr("clip-path", "url(#pbihrpsortMenuClip)");

			const sortMenuContainer = sortMenuContainerClipGroup.append("g")
				.attr("transform", "translate(" + (sortMenuPanel.titlePadding - sortMenuPanel.circleSize * 2 - sortMenuPanel.padding[3]) + "," + currentTranslate + ")");

			const menuRectangleBackground = sortMenuContainer.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", sortMenuPanel.width)
				.attr("height", sortMenuPanel.height)
				.style("fill", "none")
				.attr("pointer-events", "all");

			const sortGroups = sortMenuContainer.selectAll(null)
				.data(sortByArrayFiltered)
				.enter()
				.append("g")
				.attr("transform", function(_, i) {
					return "translate(" + sortMenuPanel.padding[3] + "," + (sortMenuPanel.groupHeight * i) + ")";
				})
				.attr("cursor", "pointer")
				.attr("pointer-events", "all");

			const sortGroupsText = sortGroups.append("text")
				.attr("class", "pbihrpsortGroupText")
				.attr("x", sortMenuPanel.itemPadding)
				.attr("y", sortMenuPanel.groupHeight / 1.35)
				.text(function(d) {
					return d === "hrpfunding" ? sortByValues[d] + "/CBPF target" : sortByValues[d];
				});

			const sortGroupsOuterCircle = sortGroups.append("circle")
				.attr("class", "pbihrpsortGroupsOuterCircle")
				.attr("r", sortMenuPanel.circleSize)
				.attr("cx", sortMenuPanel.circleSize)
				.attr("cy", sortMenuPanel.groupHeight / 2)
				.style("fill", "none")
				.style("stroke", "darkslategray");

			const sortGroupsInnerCircle = sortGroups.append("circle")
				.attr("class", "pbihrpsortGroupsInnerCircle")
				.attr("r", sortMenuPanel.innerCircleSize)
				.attr("cx", sortMenuPanel.circleSize)
				.attr("cy", sortMenuPanel.groupHeight / 2)
				.style("stroke", "none")
				.style("fill", function(d) {
					return chartState.sortBy === d ? "darkslategray" : "none";
				});

			sortMenuPanel.main.on("mouseover", function() {

				if (activeSortMenu) return;

				currentHoveredElement = this;

				sortMenuContainer.transition()
					.duration(duration)
					.attr("transform", "translate(" + sortMenuPanel.titlePadding + "," + sortMenuVertAlign + ")")
					.on("start", function() {
						activeSortMenu = true;
					})
					.on("end", function() {
						activeSortMenu = false;
					});

				menuRectangle.transition()
					.duration(duration)
					.style("opacity", sortMenuRectangleOpacity)
					.attr("height", sortMenuPanel.height);

				menuRectangleClip.transition()
					.duration(duration)
					.attr("height", sortMenuPanel.height);

			}).on("mouseleave", function() {

				if (isSnapshotTooltipVisible) return;
				currentHoveredElem = null;

				activeSortMenu = false;

				currentTranslate = calculateTranslate();

				sortMenuContainer.transition()
					.duration(duration)
					.attr("transform", "translate(" + (sortMenuPanel.titlePadding - sortMenuPanel.circleSize * 2 - sortMenuPanel.padding[3]) + "," + currentTranslate + ")");

				menuRectangle.transition()
					.duration(duration)
					.style("opacity", 0)
					.attr("height", sortMenuPanel.groupHeight);

				menuRectangleClip.transition()
					.duration(duration)
					.attr("height", sortMenuPanel.groupHeight);

			});

			sortGroups.on("click", function(d) {
				chartState.sortBy = d;

				if (queryStringValues.has("sortby")) {
					queryStringValues.set("sortby", d);
				} else {
					queryStringValues.append("sortby", d);
				};

				sortGroupsInnerCircle.style("fill", function(d) {
					return chartState.sortBy === d ? "darkslategray" : "none";
				});
				d3.select(currentHoveredElement).dispatch("mouseleave");

				const data = completeData.find(function(d) {
					return d.year === chartState.selectedYear;
				});

				createBarChartPanel(data);

				createNonHrpPanel(data);
			});

			function calculateTranslate() {
				const index = sortByArrayFiltered.indexOf(chartState.sortBy);
				return index ? -sortMenuPanel.groupHeight * index + sortMenuVertAlign : sortMenuVertAlign;
			};

			//end of createSortMenu
		};

		function processData(rawData) {

			const completeData = [];

			rawData.forEach(function(row) {
				if (row.ClstNm === "xxx" || row.ClstNm === "yyy") {

					const thisValues = {
						cbpfName: row.PFNm,
						cbpfId: row.PFId,
						cbpffunding: +row.PFFunded,
						cbpftarget: +row.PFHRPTarget,
						cbpfpercentage: +row.PFHRPTarget === 0 ? 0 : (+row.PFFunded) / (+row.PFHRPTarget),
						hrpfunding: +row.HRPClstFunded,
						hrprequirements: +row.HRPClstReq
					};
					const foundYear = completeData.find(function(d) {
						return d.year === +row.TargYr
					});
					if (foundYear) {
						if (row.ClstNm === "xxx") {
							foundYear.totalData.cbpffunding += +row.PFFunded;
							foundYear.totalData.cbpftarget += +row.PFHRPTarget;
							foundYear.totalData.hrpfunding += +row.HRPClstFunded;
							foundYear.totalData.hrprequirements += +row.HRPClstReq;
							foundYear.hrpData.push(thisValues);
						} else {
							foundYear.nonHrpData.push(thisValues);
						};
					} else {
						if (row.ClstNm === "xxx") {
							completeData.push({
								year: +row.TargYr,
								hrpYear: +row.HRPYr,
								totalData: {
									cbpffunding: +row.PFFunded,
									cbpftarget: +row.PFHRPTarget,
									hrpfunding: +row.HRPClstFunded,
									hrprequirements: +row.HRPClstReq
								},
								hrpData: [thisValues],
								nonHrpData: []
							});
						} else {
							completeData.push({
								year: +row.TargYr,
								hrpYear: +row.HRPYr,
								totalData: {
									cbpffunding: +row.PFFunded,
									cbpftarget: +row.PFHRPTarget,
									hrpfunding: +row.HRPClstFunded,
									hrprequirements: +row.HRPClstReq
								},
								hrpData: [],
								nonHrpData: [thisValues]
							});
						};
					}
				};
			});

			return completeData;

			//end of processData
		};

		function validateYear(yearString) {
			chartState.selectedYear = yearsArray.indexOf(+yearString) > -1 ? +yearString : currentYear;
		};

		function parseTransform(translate) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			let siString = d3.formatPrefix("." + digits, value)(value);
			if (siString[siString.length - 1] === "G") {
				siString = siString.slice(0, -1) + "B";
			};
			return siString;
		};

		function reverseFormat(s) {
			if (+s === 0) return 0;
			let returnValue;
			const transformation = {
				Y: Math.pow(10, 24),
				Z: Math.pow(10, 21),
				E: Math.pow(10, 18),
				P: Math.pow(10, 15),
				T: Math.pow(10, 12),
				G: Math.pow(10, 9),
				B: Math.pow(10, 9),
				M: Math.pow(10, 6),
				k: Math.pow(10, 3),
				h: Math.pow(10, 2),
				da: Math.pow(10, 1),
				d: Math.pow(10, -1),
				c: Math.pow(10, -2),
				m: Math.pow(10, -3),
				μ: Math.pow(10, -6),
				n: Math.pow(10, -9),
				p: Math.pow(10, -12),
				f: Math.pow(10, -15),
				a: Math.pow(10, -18),
				z: Math.pow(10, -21),
				y: Math.pow(10, -24)
			};
			Object.keys(transformation).some(function(k) {
				if (s.indexOf(k) > 0) {
					returnValue = parseFloat(s.split(k)[0]) * transformation[k];
					return true;
				}
			});
			return returnValue;
		};

		function createCsv(datahere) {

			const csv = d3.csvFormat(changedDataHere);

			return csv;
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbihrpOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + height);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbihrpArrowMarker")
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 0)
				.attr("refY", 0)
				.attr("markerWidth", 12)
				.attr("markerHeight", 12)
				.attr("orient", "auto")
				.append("path")
				.style("fill", "#E56A54")
				.attr("d", "M0,-5L10,0L0,5");

			const mainTextWhite = helpSVG.append("text")
				.attr("font-family", "Roboto")
				.attr("font-size", "26px")
				.style("stroke-width", "5px")
				.attr("font-weight", 700)
				.style("stroke", "white")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const mainText = helpSVG.append("text")
				.attr("class", "pbihrpAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");



			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
		};

		function createFooterDiv() {

			let footerText = "© OCHA CBPF Section " + currentYear;

			const footerLink = " | For more information, please visit <a href='https://pfbi.unocha.org'>pfbi.unocha.org</a>";

			if (showLink) footerText += footerLink;

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText);

			//end of createFooterDiv
		};

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "pbihrpDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbihrpDownloadingDivSvg")
				.attr("width", 200)
				.attr("height", 100);

			const downloadingDivText = "Downloading " + type.toUpperCase();

			createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

			const svgRealSize = svg.node().getBoundingClientRect();

			svg.attr("width", svgRealSize.width)
				.attr("height", svgRealSize.height);

			const listOfStyles = [
				"font-size",
				"font-family",
				"font-weight",
				"fill",
				"stroke",
				"stroke-dasharray",
				"stroke-width",
				"opacity",
				"text-anchor",
				"text-transform",
				"shape-rendering",
				"letter-spacing",
				"white-space"
			];

			const imageDiv = containerDiv.node();

			setSvgStyles(svg.node());

			if (type === "png") {
				iconsDiv.style("opacity", 0);
			} else {
				topDiv.style("opacity", 0)
			};

			snapshotTooltip.style("display", "none");

			html2canvas(imageDiv).then(function(canvas) {

				svg.attr("width", null)
					.attr("height", null);

				if (type === "png") {
					iconsDiv.style("opacity", 1);
				} else {
					topDiv.style("opacity", 1)
				};

				if (type === "png") {
					downloadSnapshotPng(canvas);
				} else {
					downloadSnapshotPdf(canvas);
				};

				if (fromContextMenu && currentHoveredElement) d3.select(currentHoveredElement).dispatch("mouseout");

			});

			function setSvgStyles(node) {

				if (!node.style) return;

				let styles = getComputedStyle(node);

				for (let i = 0; i < listOfStyles.length; i++) {
					node.style[listOfStyles[i]] = styles[listOfStyles[i]];
				};

				for (let i = 0; i < node.childNodes.length; i++) {
					setSvgStyles(node.childNodes[i]);
				};
			};

			//end of createSnapshot
		};

		function downloadSnapshotPng(source) {

			const currentDate = new Date();

			const fileName = "CBPFvsHRP_" + csvDateFormat(currentDate) + ".png";

			source.toBlob(function(blob) {
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				if (link.download !== undefined) {
					link.setAttribute("href", url);
					link.setAttribute("download", fileName);
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				} else {
					window.location.href = url;
				};
			});

			removeProgressWheel();

			d3.select("#pbihrpDownloadingDiv").remove();

		};

		function downloadSnapshotPdf(source) {

			const pdfMargins = {
				top: 10,
				bottom: 16,
				left: 20,
				right: 30
			};

			d3.image("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/bilogo.png")
				.then(function(logo) {

					let pdf;

					const point = 2.834646;

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;
					const heightInMilimeters = widthInMilimeters * (sourceDimentions.height / sourceDimentions.width);
					const maxHeightInMilimeters = 180;
					let pdfHeight;

					if (heightInMilimeters > maxHeightInMilimeters) {
						pdfHeight = 297 + heightInMilimeters - maxHeightInMilimeters;
						pdf = new jsPDF({
							format: [210 * point, (pdfHeight) * point],
							unit: "mm"
						})
					} else {
						pdfHeight = 297;
						pdf = new jsPDF();
					}

					let pdfTextPosition;

					createLetterhead();

					const intro = pdf.splitTextToSize("TEXT HERE.", (210 - pdfMargins.left - pdfMargins.right), {
						fontSize: 12
					});

					const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

					pdf.setTextColor(60);
					pdf.setFont('helvetica');
					pdf.setFontType("normal");
					pdf.setFontSize(12);
					pdf.text(pdfMargins.left, 48, intro);

					pdf.setTextColor(65, 143, 222);
					pdf.setFont('helvetica');
					pdf.setFontType("bold");
					pdf.setFontSize(16);
					pdf.text(chartTitle, pdfMargins.left, 65);

					pdf.setFontSize(12);

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div>", pdfMargins.left, 70, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

					const currentDate = new Date();

					pdf.save("CBPFvsHRP_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbihrpDownloadingDiv").remove();

					function createLetterhead() {

						const footer = "© OCHA CBPF Section 2019 | For more information, please visit pfbi.unocha.org";

						pdf.setFillColor(65, 143, 222);
						pdf.rect(0, pdfMargins.top, 210, 15, "F");

						pdf.setFillColor(236, 161, 84);
						pdf.rect(0, pdfMargins.top + 15, 210, 2, "F");

						pdf.setFillColor(255, 255, 255);
						pdf.rect(pdfMargins.left, pdfMargins.top - 1, 94, 20, "F");

						pdf.ellipse(pdfMargins.left, pdfMargins.top + 9, 5, 9, "F");
						pdf.ellipse(pdfMargins.left + 94, pdfMargins.top + 9, 5, 9, "F");

						pdf.addImage(logo, "PNG", pdfMargins.left + 2, pdfMargins.top, 90, 18);

						pdf.setFillColor(236, 161, 84);
						pdf.rect(0, pdfHeight - pdfMargins.bottom, 210, 2, "F");

						pdf.setTextColor(60);
						pdf.setFont("arial");
						pdf.setFontType("normal");
						pdf.setFontSize(10);
						pdf.text(footer, pdfMargins.left, pdfHeight - pdfMargins.bottom + 10);

					};

				});

			//end of downloadSnapshotPdf
		};

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg.append("g")
				.attr("class", "pbihrpd3chartwheelGroup")
				.attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 4 + ")");

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text(thistext);

			const arc = d3.arc()
				.outerRadius(25)
				.innerRadius(20);

			const wheel = wheelGroup.append("path")
				.datum({
					startAngle: 0,
					endAngle: 0
				})
				.classed("contributionColorFill", true)
				.attr("d", arc);

			transitionIn();

			function transitionIn() {
				wheel.transition()
					.duration(1000)
					.attrTween("d", function(d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function(t) {
							d.endAngle = interpolate(t);
							return arc(d)
						}
					})
					.on("end", transitionOut)
			};

			function transitionOut() {
				wheel.transition()
					.duration(1000)
					.attrTween("d", function(d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function(t) {
							d.startAngle = interpolate(t);
							return arc(d)
						}
					})
					.on("end", function(d) {
						d.startAngle = 0;
						transitionIn()
					})
			};

			//end of createProgressWheel
		};

		function removeProgressWheel() {
			const wheelGroup = d3.select(".pbihrpd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());