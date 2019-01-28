(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1 ? true : false;

	const fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css";

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbicli.css", fontAwesomeLink];

	const d3URL = "https://d3js.org/d3.v5.min.js";

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			if (cssLink === fontAwesomeLink) {
				externalCSS.setAttribute("integrity", "sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/");
				externalCSS.setAttribute("crossorigin", "anonymous")
			}
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isD3Loaded(d3URL)) {
		if (!isInternetExplorer) {
			loadScript(d3URL, d3Chart);
		} else {
			loadScript("https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js", function() {
				loadScript("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js", function() {
					loadScript(d3URL, d3Chart);
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		d3Chart();
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

	function isD3Loaded(url) {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == url) return true;
		}
		return false;
	};

	function d3Chart() {

		const width = 900,
			padding = [4, 4, 4, 4],
			height = 360,
			panelVerticalPadding = 12,
			flagSize = 16,
			flagPadding = 2,
			circleRadius = 2.5,
			localVariable = d3.local(),
			currentYear = new Date().getFullYear(),
			parseTime = d3.timeParse("%Y"),
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			monthsMargin = 2,
			showFutureGroupPadding = 240,
			labelPadding = 10,
			labelDistance = 2,
			labelGroupHeight = 14,
			fadeOpacity = 0.1,
			defaultYMaxValue = 100000000,
			currencyLabelPadding = 8,
			futureTextPadding = 8,
			duration = 1000,
			excelIconSize = 20,
			checkboxesLimit = 20,
			excelIconPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/excelicon.png",
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags16/",
			chartState = {
				selectedDonors: [],
				selectedCbpfs: [],
				controlledBy: null,
				showLocal: false,
				selectedLocalCurrency: null
			},
			currencySymbols = {
				GBP: "\u00A3",
				EUR: "\u20AC"
			},
			iso2Names = {},
			checkedDonors = {},
			checkedCbpfs = {},
			currencyByCountry = {};

		const containerDiv = d3.select("#d3chartcontainerpbicli");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		chartState.futureDonations = (containerDiv.node().getAttribute("data-showfuture") === "true");

		if (selectedResponsiveness === false || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const outerDiv = containerDiv.append("div")
			.attr("class", "pbicliOuterDiv");

		const topDiv = outerDiv.append("div")
			.attr("class", "pbicliTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbicliTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbicliIconsDiv");

		const topSelectionDiv = outerDiv.append("div")
			.attr("class", "pbicliTopSelectionDiv");

		const donorsSelectionDiv = topSelectionDiv.append("div")
			.attr("class", "pbicliDonorsSelectionDiv");

		const cbpfsSelectionDiv = topSelectionDiv.append("div")
			.attr("class", "pbicliCbpfsSelectionDiv");

		const filtersDiv = outerDiv.append("div")
			.attr("class", "pbicliFiltersDiv");

		const borderDiv = outerDiv.append("div")
			.attr("class", "pbicliBorderDiv");

		const legendDiv = outerDiv.append("div")
			.attr("class", "pbicliLegendDiv");

		const donorsLegendDiv = legendDiv.append("div")
			.attr("class", "pbicliDonorsLegendDiv");

		const donorsLegendDivTop = donorsLegendDiv.append("div")
			.attr("class", "pbicliDonorsLegendDivTop");

		const donorsLegendDivBottom = donorsLegendDiv.append("div")
			.attr("class", "pbicliDonorsLegendDivBottom");

		const cbpfsLegendDiv = legendDiv.append("div")
			.attr("class", "pbicliCbpfsLegendDiv");

		const cbpfsLegendDivTop = cbpfsLegendDiv.append("div")
			.attr("class", "pbicliCbpfsLegendDivTop");

		const cbpfsLegendDivBottom = cbpfsLegendDiv.append("div")
			.attr("class", "pbicliCbpfsLegendDivBottom");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height);

		const footerDiv = containerDiv.append("div")
			.attr("class", "pbicliFooterDiv");

		createProgressWheel();

		const tooltip = d3.select("body").append("div")
			.attr("id", "pbiclitooltipdiv")
			.style("display", "none");

		const donorsLinesPanel = {
			main: svg.append("g")
				.attr("class", "pbicliDonorsLinesPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: height - padding[0] - padding[2],
			padding: [16, 40, 16, 32]
		};

		const cbpfsLinesPanel = {
			main: svg.append("g")
				.attr("class", "pbicliCbpfsLinesPanel")
				.attr("transform", "translate(" + (padding[3] + donorsLinesPanel.width + panelVerticalPadding) + "," + padding[0] + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: height - padding[0] - padding[2],
			padding: [16, 40, 16, 32]
		};

		const donorsPanelDefs = donorsLinesPanel.main.append("defs");

		const donorsPanelClipPaths = donorsPanelDefs.append("clipPath")
			.attr("id", "pbicliDonorsPanelClipPaths")
			.append("rect")
			.attr("x", donorsLinesPanel.padding[3])
			.attr("y", donorsLinesPanel.padding[0])
			.attr("height", donorsLinesPanel.height - donorsLinesPanel.padding[2] - donorsLinesPanel.padding[0]);

		const donorsPanelClipCircles = donorsPanelDefs.append("clipPath")
			.attr("id", "pbicliDonorsPanelClipCircles")
			.append("rect")
			.attr("x", donorsLinesPanel.padding[3])
			.attr("y", donorsLinesPanel.padding[0])
			.attr("height", donorsLinesPanel.height - donorsLinesPanel.padding[2] - donorsLinesPanel.padding[0]);

		const cbpfsPanelDefs = cbpfsLinesPanel.main.append("defs");

		const cbpfsPanelClipPaths = cbpfsPanelDefs.append("clipPath")
			.attr("id", "pbicliCbpfsPanelClipPaths")
			.append("rect")
			.attr("x", cbpfsLinesPanel.padding[3])
			.attr("y", cbpfsLinesPanel.padding[0])
			.attr("height", cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2] - cbpfsLinesPanel.padding[0]);

		const cbpfsPanelClipCircles = cbpfsPanelDefs.append("clipPath")
			.attr("id", "pbicliCbpfsPanelClipCircles")
			.append("rect")
			.attr("x", cbpfsLinesPanel.padding[3])
			.attr("y", cbpfsLinesPanel.padding[0])
			.attr("height", cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2] - cbpfsLinesPanel.padding[0]);

		const xScaleDonors = d3.scaleTime()
			.range([donorsLinesPanel.padding[3], donorsLinesPanel.width - donorsLinesPanel.padding[1]]);

		const xScaleCbpfs = d3.scaleTime()
			.range([cbpfsLinesPanel.padding[3], cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1]]);

		const yScaleDonors = d3.scaleLinear()
			.range([donorsLinesPanel.height - donorsLinesPanel.padding[2], donorsLinesPanel.padding[0]]);

		const yScaleCbpfs = d3.scaleLinear()
			.range([cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2], cbpfsLinesPanel.padding[0]]);

		const yScaleDonorsLocalCurrency = d3.scaleLinear()
			.range([donorsLinesPanel.height - donorsLinesPanel.padding[2], donorsLinesPanel.padding[0]]);

		const lineGeneratorDonors = d3.line()
			.x(function(d) {
				return xScaleDonors(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleDonors(d.total)
			})
			.curve(d3.curveCatmullRom)

		const lineGeneratorCbpfs = d3.line()
			.x(function(d) {
				return xScaleCbpfs(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleCbpfs(d.total)
			})
			.curve(d3.curveCatmullRom)

		const lineGeneratorDonorsLocalCurrency = d3.line()
			.x(function(d) {
				return xScaleDonors(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleDonorsLocalCurrency(d.localTotal)
			})
			.curve(d3.curveCatmullRom)

		const xAxisDonors = d3.axisBottom(xScaleDonors)
			.tickSizeInner(4)
			.tickSizeOuter(0)
			.ticks(8);

		const xAxisCbpfs = d3.axisBottom(xScaleCbpfs)
			.tickSizeInner(4)
			.tickSizeOuter(0)
			.ticks(8);

		const yAxisDonors = d3.axisLeft(yScaleDonors)
			.tickSizeInner(-(donorsLinesPanel.width - donorsLinesPanel.padding[3] - donorsLinesPanel.padding[1]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(formatSIaxes);

		const yAxisCbpfs = d3.axisLeft(yScaleCbpfs)
			.tickSizeInner(-(cbpfsLinesPanel.width - cbpfsLinesPanel.padding[3] - cbpfsLinesPanel.padding[1]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(formatSIaxes);

		const yAxisDonorsLocalCurrency = d3.axisRight(yScaleDonorsLocalCurrency)
			.tickSizeInner(3)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(formatSIaxes);

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv")
			.then(function(rawData) {

				removeProgressWheel();

				rawData.sort(function(a, b) {
					return (+a.FiscalYear) - (+b.FiscalYear);
				});

				rawData = rawData.filter(function(d) {
					return d.GMSDonorName !== "" && d.GMSDonorISO2Code !== "";
				});

				const list = processList(rawData);

				saveFlags(list.donorsArray);

				draw(rawData, list);

				//end of d3.csv
			});

		function draw(rawData, list) {

			createTitle();

			createDonorsDropdown(list.donorsArray);

			createCurrencyDropdown(list.currenciesArray);

			createCbpfsDropdown(list.cbpfsArray);

			createFilters();

			createFooterDiv();

			const timeExtent = setTimeExtent(list.yearsArray);

			xScaleDonors.domain(timeExtent);

			xScaleCbpfs.domain(timeExtent);

			yScaleDonors.domain([0, defaultYMaxValue]);

			yScaleDonorsLocalCurrency.domain([0, defaultYMaxValue]);

			yScaleCbpfs.domain([0, defaultYMaxValue]);

			const yAxisLabelDonors = donorsLinesPanel.main.append("text")
				.attr("class", "pbicliYAxisLabel")
				.attr("text-anchor", "end")
				.attr("x", donorsLinesPanel.padding[3] - 2)
				.attr("y", donorsLinesPanel.padding[0] - currencyLabelPadding)
				.text("USD");

			const yAxisLabelDonorsLocalCurrency = donorsLinesPanel.main.append("text")
				.attr("class", "pbicliYAxisLabelLocalCurrency")
				.attr("text-anchor", "start")
				.attr("x", donorsLinesPanel.padding[3] + 2)
				.attr("y", donorsLinesPanel.padding[0] - currencyLabelPadding);

			const yAxisLabelCbpfs = cbpfsLinesPanel.main.append("text")
				.attr("class", "pbicliYAxisLabel")
				.attr("text-anchor", "end")
				.attr("x", cbpfsLinesPanel.padding[3] - 2)
				.attr("y", cbpfsLinesPanel.padding[0] - currencyLabelPadding)
				.text("USD");

			const futureDonationsGroupDonors = donorsLinesPanel.main.append("g")
				.attr("class", "pbicliFutureDonationsGroupDonors")
				.style("opacity", chartState.futureDonations ? 1 : 0);

			futureDonationsGroupDonors.attr("transform", "translate(" + xScaleDonors(parseTime(currentYear)) + ",0)");

			const futureDonationsLineDonors = futureDonationsGroupDonors.append("line")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", donorsLinesPanel.padding[0])
				.attr("y2", donorsLinesPanel.height - donorsLinesPanel.padding[2])
				.style("stroke-width", "1px")
				.style("stroke", "darkseagreen")
				.style("stroke-dasharray", "4,4");

			const futureDonationsTextDonors = futureDonationsGroupDonors.append("text")
				.attr("class", "pbicliFutureDonationsText")
				.attr("y", futureTextPadding)
				.text("Future Donations");

			const futureDonationsGroupCbpfs = cbpfsLinesPanel.main.append("g")
				.attr("class", "pbicliFutureDonationsGroupCbpfs")
				.style("opacity", chartState.futureDonations ? 1 : 0);

			futureDonationsGroupCbpfs.attr("transform", "translate(" + xScaleCbpfs(parseTime(currentYear)) + ",0)");

			const futureDonationsLineCbpfs = futureDonationsGroupCbpfs.append("line")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", donorsLinesPanel.padding[0])
				.attr("y2", donorsLinesPanel.height - donorsLinesPanel.padding[2])
				.style("stroke-width", "1px")
				.style("stroke", "darkseagreen")
				.style("stroke-dasharray", "4,4");

			const futureDonationsTextCbpfs = futureDonationsGroupCbpfs.append("text")
				.attr("class", "pbicliFutureDonationsText")
				.attr("y", futureTextPadding)
				.text("Future Donations");

			const groupXAxisDonors = donorsLinesPanel.main.append("g")
				.attr("class", "pbicligroupXAxisDonors")
				.attr("transform", "translate(0," + (donorsLinesPanel.height - donorsLinesPanel.padding[2]) + ")");

			const groupYAxisDonors = donorsLinesPanel.main.append("g")
				.attr("class", "pbicligroupYAxisDonors")
				.attr("transform", "translate(" + donorsLinesPanel.padding[3] + ",0)");

			const groupYAxisDonorsLocalCurrency = donorsLinesPanel.main.append("g")
				.attr("class", "pbicligroupYAxisDonorsLocalCurrency")
				.attr("transform", "translate(" + donorsLinesPanel.padding[3] + ",0)");

			groupXAxisDonors.call(xAxisDonors);

			groupYAxisDonors.call(yAxisDonors);

			groupYAxisDonorsLocalCurrency.call(yAxisDonorsLocalCurrency);

			groupYAxisDonors.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			groupYAxisDonorsLocalCurrency.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			groupYAxisDonorsLocalCurrency.style("opacity", chartState.showLocal ? 1 : 0);

			groupYAxisDonors.select(".domain").raise();

			const groupXAxisCbpfs = cbpfsLinesPanel.main.append("g")
				.attr("class", "pbicligroupXAxisCbpfs")
				.attr("transform", "translate(0," + (cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2]) + ")");

			const groupYAxisCbpfs = cbpfsLinesPanel.main.append("g")
				.attr("class", "pbicligroupYAxisCbpfs")
				.attr("transform", "translate(" + cbpfsLinesPanel.padding[3] + ",0)");

			groupXAxisCbpfs.call(xAxisCbpfs);

			groupYAxisCbpfs.call(yAxisCbpfs);

			groupYAxisCbpfs.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			groupYAxisCbpfs.select(".domain").raise();

			createTopLegend();

			createAnnotationsDiv();

			containerDiv.select("#pbicliDonorsDropdown").on("change", function() {

				let thisIsoCode;

				for (let key in iso2Names) {
					if (iso2Names[key] === this.value) thisIsoCode = key;
				};

				if (chartState.showLocal && currencyByCountry[thisIsoCode] !== chartState.selectedLocalCurrency && chartState.selectedLocalCurrency !== null) {

					console.log(chartState)
					createCurrencyOverDiv2();
					containerDiv.select("#pbicliDonorsDropdown").select("option")
						.property("selected", true);
					return;
				} else {

					if (chartState.showLocal && chartState.selectedLocalCurrency === null) chartState.selectedLocalCurrency = currencyByCountry[thisIsoCode];

					chartState.selectedCbpfs = [];

					if (chartState.controlledBy !== "donor") {
						filtersDiv.selectAll(".pbicliRadioButtons input")
							.property("disabled", false);
						for (let key in checkedDonors) {
							checkedDonors[key] = true;
						};
						for (let key in checkedCbpfs) {
							checkedCbpfs[key] = true;
						};
					};

					chartState.controlledBy = "donor";

					const value = this.value;

					let selected;

					if (value === "Top 5 donors") {
						selected = list.donorsArray.slice(0, 5);
						chartState.selectedDonors = selected;
					} else {
						d3.select(this).selectAll("option").each(function(d) {
							if (iso2Names[d] === value) selected = d;
						});
						if (chartState.selectedDonors.indexOf(selected) === -1) {
							chartState.selectedDonors.push(selected);
						} else {
							return
						};
					};

					containerDiv.select("#pbicliCbpfsDropdown").select("option")
						.property("selected", true);

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createTopLegend();

					createSelectedDonors();

					createCbpfCheckboxes(data.cbpfs);

					createDonorsLines(data.donors);

					createCbpfsLines(data.cbpfs);

				};

			});

			containerDiv.select("#pbicliCbpfsDropdown").on("change", function() {

				chartState.selectedDonors = [];

				if (chartState.controlledBy !== "cbpf") {
					filtersDiv.selectAll(".pbicliRadioButtons input")
						.property("disabled", true);
					filtersDiv.select(".pbicliRadioButtons input")
						.property("checked", true);
					chartState.selectedLocalCurrency = null;
					changeDonorsDropdown(list.donorsArray, true);
					containerDiv.select("#pbicliCurrencyDropdown")
						.selectAll("option")
						.property("selected", function(_, i) {
							return !i;
						});
					chartState.showLocal = false;
					for (let key in checkedDonors) {
						checkedDonors[key] = true;
					};
					for (let key in checkedCbpfs) {
						checkedCbpfs[key] = true;
					};
				};

				chartState.controlledBy = "cbpf";

				const value = this.value;

				let selected;

				if (value === "Top 5 CBPFs") {
					selected = list.cbpfsArray.slice(0, 5);
					chartState.selectedCbpfs = selected;
				} else {
					d3.select(this).selectAll("option").each(function(d) {
						if (iso2Names[d] === value) selected = d;
					});
					if (chartState.selectedCbpfs.indexOf(selected) === -1) {
						chartState.selectedCbpfs.push(selected);
					} else {
						return
					};
				};

				containerDiv.select("#pbicliDonorsDropdown").select("option")
					.property("selected", true);

				const data = populateData(rawData);

				yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

				yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

				yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

				createTopLegend();

				createSelectedCbpfs();

				createDonorsCheckboxes(data.donors);

				createDonorsLines(data.donors);

				createCbpfsLines(data.cbpfs);

			});

			containerDiv.select("#pbicliCurrencyDropdown").on("change", function() {

				chartState.selectedCbpfs = [];

				if (chartState.controlledBy === "cbpf") {
					for (let key in checkedDonors) {
						checkedDonors[key] = true;
					};
					for (let key in checkedCbpfs) {
						checkedCbpfs[key] = true;
					};
				};

				chartState.controlledBy = "donor";

				const value = this.value;

				const selected = [];

				if (value === "USD (all donors)") {
					chartState.selectedDonors = [];
					chartState.selectedLocalCurrency = null;
					changeDonorsDropdown(list.donorsArray, true);
				} else {
					for (let key in currencyByCountry) {
						if (currencyByCountry[key] === value) selected.push(key);
					};
					chartState.selectedDonors = selected;
					chartState.selectedLocalCurrency = value;
					changeDonorsDropdown(chartState.selectedDonors, false);
				};

				containerDiv.select("#pbicliCbpfsDropdown").select("option")
					.property("selected", true);

				const data = populateData(rawData);

				yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

				yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

				yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

				createTopLegend();

				createSelectedDonors();

				createCbpfCheckboxes(data.cbpfs);

				createDonorsLines(data.donors);

				createCbpfsLines(data.cbpfs);

			});

			filtersDiv.selectAll(".pbicliRadioButtons input").on("change", function() {

				const value = this.value;

				const allCurrencies = chartState.selectedDonors.map(function(d) {
					return currencyByCountry[d];
				}).filter(function(value, index, self) {
					return self.indexOf(value) === index;
				});

				if (value === "local" && allCurrencies.length > 1) {

					createCurrencyOverDiv();

					d3.selectAll(".pbiclialertyesorno").on("click", function(d) {
						if (d === "YES") {

							d3.select(".pbicliOverDiv").remove();

							chartState.showLocal = value === "local";

							chartState.selectedDonors = [];

							containerDiv.select("#pbicliDonorsDropdown").select("option")
								.property("selected", true);

							const data = populateData(rawData);

							yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

							yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

							yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

							createSelectedDonors();

							createCbpfCheckboxes(data.cbpfs);

							createDonorsLines(data.donors);

							createCbpfsLines(data.cbpfs);

						} else {

							d3.select(".pbicliOverDiv").remove();

							chartState.showLocal = false;

							filtersDiv.select(".pbicliRadioButtons input")
								.property("checked", true);

						};
					});

				} else {

					chartState.showLocal = value === "local";

					chartState.selectedLocalCurrency = value === "local" && allCurrencies.length ?
						allCurrencies[0] : null;

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createDonorsLines(data.donors);

				};

			});

			filtersDiv.select(".pbicliCheckbox input").on("change", function() {

				chartState.futureDonations = this.checked;

				const timeExtent = setTimeExtent(list.yearsArray);

				xScaleDonors.domain(timeExtent);

				xScaleCbpfs.domain(timeExtent);

				const data = populateData(rawData);

				createDonorsLines(data.donors);

				createCbpfsLines(data.cbpfs);

			});

			function createSelectedDonors() {

				donorsLegendDivBottom.selectAll(".pbicliCheckboxDonorsDiv").remove();

				const selectedDonors = donorsLegendDivBottom.selectAll(".pbicliSelectedDonorsDiv")
					.data(chartState.selectedDonors, function(d) {
						return d;
					});

				const selectedDonorsEnter = selectedDonors.enter()
					.append("div")
					.attr("class", "pbicliSelectedDonorsDiv");

				const selectedDonorsExit = selectedDonors.exit().remove();

				const textDiv = selectedDonorsEnter.append("div")
					.attr("class", "pbicliSelectedDonorsDivText")
					.html(function(d) {
						return iso2Names[d]
					});

				const flagDiv = selectedDonorsEnter.append("div")
					.attr("class", "pbicliSelectedDonorsFlagDiv")
					.append("img")
					.attr("width", flagSize)
					.attr("height", flagSize)
					.attr("src", function(d) {
						return localStorage.getItem("storedFlag" + d) ? localStorage.getItem("storedFlag" + d) :
							flagsDirectory + d + ".png";
					});

				const closeDiv = selectedDonorsEnter.append("div")
					.attr("class", "pbicliSelectedDonorsCloseDiv");

				closeDiv.append("span")
					.attr("class", "fas fa-times");

				closeDiv.on("click", function(d) {

					chartState.selectedDonors = chartState.selectedDonors.filter(function(e) {
						return e !== d;
					});

					d3.select(this.parentNode).remove();

					const dropdownValue = d3.select("#pbicliDonorsDropdown").node().value;

					if (dropdownValue === iso2Names[d] || !chartState.selectedDonors.length) {
						containerDiv.select("#pbicliDonorsDropdown").select("option")
							.property("selected", true);
					};

					if (!chartState.selectedDonors.length) chartState.selectedLocalCurrency = null;

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createCbpfCheckboxes(data.cbpfs);

					createDonorsLines(data.donors);

					createCbpfsLines(data.cbpfs);

				});

				//end of createSelectedDonors
			};

			function createSelectedCbpfs() {

				cbpfsLegendDivBottom.selectAll(".pbicliCheckboxCbpfsDiv").remove();

				const selectedCbpfs = cbpfsLegendDivBottom.selectAll(".pbicliSelectedCbpfsDiv")
					.data(chartState.selectedCbpfs, function(d) {
						return d;
					});

				const selectedCbpfsEnter = selectedCbpfs.enter()
					.append("div")
					.attr("class", "pbicliSelectedCbpfsDiv");

				const selectedCbpfsExit = selectedCbpfs.exit().remove();

				const textDiv = selectedCbpfsEnter.append("div")
					.attr("class", "pbicliSelectedCbpfsDivText")
					.html(function(d) {
						return iso2Names[d]
					});

				const closeDiv = selectedCbpfsEnter.append("div")
					.attr("class", "pbicliSelectedCbpfsCloseDiv");

				closeDiv.append("span")
					.attr("class", "fas fa-times");

				closeDiv.on("click", function(d) {

					chartState.selectedCbpfs = chartState.selectedCbpfs.filter(function(e) {
						return e !== d;
					});

					d3.select(this.parentNode).remove();

					const dropdownValue = d3.select("#pbicliCbpfsDropdown").node().value;

					if (dropdownValue === iso2Names[d]) {
						containerDiv.select("#pbicliCbpfsDropdown").select("option")
							.property("selected", true);
					};

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createDonorsCheckboxes(data.donors);

					createDonorsLines(data.donors);

					createCbpfsLines(data.cbpfs);

				});

				//end of createSelectedCbpfs
			};

			function createDonorsCheckboxes(donorsDataOriginal) {

				donorsDataOriginal.sort(function(a, b) {
					return b.total - a.total;
				});

				const donorsData = donorsDataOriginal.map(function(d) {
					return d.isoCode
				});

				donorsData.push("All donors");

				donorsLegendDivBottom.selectAll(".pbicliSelectedDonorsDiv").remove();

				let donorsCheckboxes = donorsLegendDivBottom.selectAll(".pbicliCheckboxDonorsDiv")
					.data(donorsData, function(d) {
						return d;
					});

				const donorsCheckboxesExit = donorsCheckboxes.exit().remove();

				const donorsCheckboxesEnter = donorsCheckboxes.enter()
					.append("div")
					.attr("class", "pbicliCheckboxDonorsDiv");

				const checkbox = donorsCheckboxesEnter.append("label")
					.append("input")
					.attr("type", "checkbox")
					.attr("value", function(d) {
						return d;
					});

				const span = donorsCheckboxesEnter.append("span")
					.attr("class", "pbicliCheckboxText")
					.html(function(d) {
						return iso2Names[d] ? iso2Names[d] : d;
					});

				donorsCheckboxes = donorsCheckboxesEnter.merge(donorsCheckboxes);

				donorsCheckboxes = donorsCheckboxes.sort(function(a, b) {
					return donorsData.indexOf(a) - donorsData.indexOf(b);
				});

				donorsCheckboxes.select("input")
					.property("checked", function(d, i) {
						if (i > checkboxesLimit) {
							checkedDonors[d] = false;
							return false;
						} else {
							return checkedDonors[d];
						};
					});

				const currentlyChecked = d3.values(checkedDonors);

				const allDonors = donorsCheckboxes.filter(function(d) {
					return d === "All donors";
				}).select("input");

				allDonors.property("checked", function() {
					return currentlyChecked.every(function(d) {
						return d;
					});
				}).property("indeterminate", function() {
					const reduced = currentlyChecked.filter(function(value, index, self) {
						return self.indexOf(value) === index;
					});
					return reduced.length > 1;
				});

				donorsCheckboxes.selectAll("input").on("change", function() {

					if (this.value === "All donors") {

						for (let key in checkedDonors) {
							checkedDonors[key] = this.checked;
						};

						donorsCheckboxes.selectAll("input")
							.filter(function(d) {
								return d !== "All donors";
							})
							.property("checked", this.checked);

					} else {

						checkedDonors[this.value] = this.checked;

						const currentlyChecked = d3.values(checkedDonors);

						allDonors.property("checked", function() {
							return currentlyChecked.every(function(d) {
								return d;
							});
						}).property("indeterminate", function() {
							const reduced = currentlyChecked.filter(function(value, index, self) {
								return self.indexOf(value) === index;
							});
							return reduced.length > 1;
						});

					};

					const data = populateData(rawData);

					yScaleDonors.domain(setYDomain(data.donors, data.cbpfs));

					yScaleDonorsLocalCurrency.domain(setYDomainLocalCurrency(data.donors));

					createDonorsLines(data.donors);

				});

				//end of createDonorsCheckboxes
			};

			function createCbpfCheckboxes(cbpfsDataOriginal) {

				cbpfsDataOriginal.sort(function(a, b) {
					return b.total - a.total;
				});

				const cbpfsData = cbpfsDataOriginal.map(function(d) {
					return d.isoCode
				});

				cbpfsData.push("All CBPFs");

				cbpfsLegendDivBottom.selectAll(".pbicliSelectedCbpfsDiv").remove();

				let cbpfsCheckboxes = cbpfsLegendDivBottom.selectAll(".pbicliCheckboxCbpfsDiv")
					.data(cbpfsData, function(d) {
						return d;
					});

				const cbpfsCheckboxesExit = cbpfsCheckboxes.exit().remove();

				const cbpfsCheckboxesEnter = cbpfsCheckboxes.enter()
					.append("div")
					.attr("class", "pbicliCheckboxCbpfsDiv");

				const checkbox = cbpfsCheckboxesEnter.append("label")
					.append("input")
					.attr("type", "checkbox")
					.attr("value", function(d) {
						return d;
					});

				const span = cbpfsCheckboxesEnter.append("span")
					.attr("class", "pbicliCheckboxText")
					.html(function(d) {
						return iso2Names[d] ? iso2Names[d] : d;
					});

				cbpfsCheckboxes = cbpfsCheckboxesEnter.merge(cbpfsCheckboxes);

				cbpfsCheckboxes = cbpfsCheckboxes.sort(function(a, b) {
					return cbpfsData.indexOf(a) - cbpfsData.indexOf(b);
				});

				cbpfsCheckboxes.select("input")
					.property("checked", function(d, i) {
						if (i > checkboxesLimit) {
							checkedCbpfs[d] = false;
							return false;
						} else {
							return checkedCbpfs[d];
						};
					});

				const currentlyChecked = d3.values(checkedCbpfs);

				const allCbpfs = cbpfsCheckboxes.filter(function(d) {
					return d === "All CBPFs";
				}).select("input");

				allCbpfs.property("checked", function() {
					return currentlyChecked.every(function(d) {
						return d;
					});
				}).property("indeterminate", function() {
					const reduced = currentlyChecked.filter(function(value, index, self) {
						return self.indexOf(value) === index;
					});
					return reduced.length > 1;
				});

				cbpfsCheckboxes.selectAll("input").on("change", function() {

					if (this.value === "All CBPFs") {

						for (let key in checkedCbpfs) {
							checkedCbpfs[key] = this.checked;
						};

						cbpfsCheckboxes.selectAll("input")
							.filter(function(d) {
								return d !== "All CBPFs";
							})
							.property("checked", this.checked);

					} else {

						checkedCbpfs[this.value] = this.checked;

						const currentlyChecked = d3.values(checkedCbpfs);

						allCbpfs.property("checked", function() {
							return currentlyChecked.every(function(d) {
								return d;
							});
						}).property("indeterminate", function() {
							const reduced = currentlyChecked.filter(function(value, index, self) {
								return self.indexOf(value) === index;
							});
							return reduced.length > 1;
						});

					};

					const data = populateData(rawData);

					yScaleCbpfs.domain(setYDomain(data.donors, data.cbpfs));

					createCbpfsLines(data.cbpfs);

				});

				//end of createCbpfCheckboxes
			};

			function createDonorsLines(donorsDataOriginal) {

				const donorsData = donorsDataOriginal.filter(function(d) {
					return checkedDonors[d.isoCode];
				});

				const xAxisDonorsRightMargin = xScaleDonors(xScaleDonors.domain()[1]) -
					xScaleDonors(d3.timeMonth.offset(xScaleDonors.domain()[1], -monthsMargin));

				donorsPanelClipPaths.attr("width", donorsLinesPanel.width - donorsLinesPanel.padding[1] - donorsLinesPanel.padding[3] -
					xAxisDonorsRightMargin + 1);

				donorsPanelClipCircles.attr("width", donorsLinesPanel.width - donorsLinesPanel.padding[1] - donorsLinesPanel.padding[3] -
					xAxisDonorsRightMargin + circleRadius);

				futureDonationsGroupDonors.style("opacity", chartState.futureDonations ? 1 : 0)
					.attr("transform", "translate(" + xScaleDonors(parseTime(currentYear)) + ",0)");

				const donorsGroup = donorsLinesPanel.main.selectAll(".pbicliDonorsGroup")
					.data(donorsData, function(d) {
						return d.isoCode
					});

				const donorsGroupExit = donorsGroup.exit().remove();

				const donorsGroupEnter = donorsGroup.enter()
					.append("g")
					.attr("class", "pbicliDonorsGroup");

				const donorsPath = donorsGroupEnter.append("path")
					.attr("class", "pbicliDonorsPath")
					.attr("clip-path", "url(#pbicliDonorsPanelClipPaths)")
					.style("stroke-dasharray", 0)
					.attr("d", function(d) {
						return lineGeneratorDonors(d.values)
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				donorsPath.style("stroke-dasharray", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength + " " + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.duration(duration)
					.style("stroke-dashoffset", 0);

				const circlesEnter = donorsGroupEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.attr("clip-path", "url(#pbicliDonorsPanelClipCircles)")
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				donorsGroup.select("path")
					.transition()
					.duration(duration)
					.style("stroke-dasharray", null)
					.attr("d", function(d) {
						return lineGeneratorDonors(d.values)
					});

				const updateCircles = donorsGroup.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesExit = updateCircles.exit().remove();

				const updateCirclesEnter = updateCircles.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					})
					.attr("clip-path", "url(#pbicliDonorsPanelClipCircles)")
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCircles.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleDonors(d.total)
					});

				const donorsDataLocal = JSON.parse(JSON.stringify(donorsData)).filter(function(d) {
					return d.localCurrency !== "USD";
				});

				donorsDataLocal.forEach(function(d) {
					d.localData = true;
				});

				const donorsGroupLocal = donorsLinesPanel.main.selectAll(".pbicliDonorsGroupLocal")
					.data(donorsDataLocal, function(d) {
						return d.isoCode
					});

				const donorsGroupLocalExit = donorsGroupLocal.exit().remove();

				const donorsGroupLocalEnter = donorsGroupLocal.enter()
					.append("g")
					.attr("class", "pbicliDonorsGroupLocal")
					.style("opacity", chartState.showLocal ? 1 : 0);

				const donorsPathLocal = donorsGroupLocalEnter.append("path")
					.attr("class", "pbicliDonorsPathLocal")
					.attr("clip-path", "url(#pbicliDonorsPanelClipPaths)")
					.style("stroke-dasharray", 0)
					.attr("d", function(d) {
						return chartState.showLocal ? lineGeneratorDonorsLocalCurrency(d.values) : lineGeneratorDonors(d.values);
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				donorsPathLocal.style("stroke-dasharray", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength + " " + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.duration(duration)
					.style("stroke-dashoffset", 0);

				const circlesEnterLocal = donorsGroupLocalEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesLocal")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					})
					.attr("clip-path", "url(#pbicliDonorsPanelClipCircles)")
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				donorsGroupLocal.transition()
					.duration(duration)
					.style("opacity", chartState.showLocal ? 1 : 0);

				donorsGroupLocal.select("path")
					.transition()
					.duration(duration)
					.style("stroke-dasharray", null)
					.attr("d", function(d) {
						return chartState.showLocal ? lineGeneratorDonorsLocalCurrency(d.values) : lineGeneratorDonors(d.values);
					});

				const updateCirclesLocal = donorsGroupLocal.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesLocalExit = updateCirclesLocal.exit().remove();

				const updateCirclesLocalEnter = updateCirclesLocal.enter()
					.append("circle")
					.attr("class", "pbicliDonorsCirclesLocal")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					})
					.attr("clip-path", "url(#pbicliDonorsPanelClipCircles)")
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCirclesLocal.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return chartState.showLocal ? yScaleDonorsLocalCurrency(d.localTotal) : yScaleDonors(d.total);
					});

				let labelsData = donorsData.map(function(d) {
					let thisDatum;
					if (chartState.futureDonations) {
						thisDatum = d.values[d.values.length - 1];
					} else {
						const filteredValue = d.values.filter(function(e) {
							return e.year <= currentYear.toString();
						});
						thisDatum = filteredValue[filteredValue.length - 1];
					};
					return {
						name: isoAlpha2to3[d.isoCode.toUpperCase()],
						datum: thisDatum,
						yPos: yScaleDonors(thisDatum.total),
						isoCode: d.isoCode,
						currency: "USD"
					}
				});

				const labelsDataLocal = donorsDataLocal.map(function(d) {
					let thisDatum;
					if (chartState.futureDonations) {
						thisDatum = d.values[d.values.length - 1];
					} else {
						const filteredValue = d.values.filter(function(e) {
							return e.year <= currentYear.toString();
						});
						thisDatum = filteredValue[filteredValue.length - 1];
					};
					return {
						datum: thisDatum,
						yPos: yScaleDonorsLocalCurrency(thisDatum.localTotal),
						isoCode: d.isoCode,
						currency: d.localCurrency
					}
				});

				if (chartState.showLocal) labelsData = labelsData.concat(labelsDataLocal);

				let labelsGroupDonors = donorsLinesPanel.main.selectAll(".pbicliLabelsGroupDonors")
					.data(labelsData, function(d) {
						return d.isoCode + d.currency;
					});

				const labelsGroupDonorsExit = labelsGroupDonors.exit().remove();

				const labelsGroupDonorsEnter = labelsGroupDonors.enter()
					.append("g")
					.attr("class", "pbicliLabelsGroupDonors")
					.style("opacity", 0);

				labelsGroupDonorsEnter.attr("transform", function(d) {
					return "translate(" + (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + "," +
						d.yPos + ")";
				});

				labelsGroupDonorsEnter.append("image")
					.attr("width", flagSize)
					.attr("height", flagSize)
					.attr("y", -flagSize / 2)
					.attr("x", 0)
					.attr("xlink:href", function(d) {
						return localStorage.getItem("storedFlag" + d.isoCode) ? localStorage.getItem("storedFlag" + d.isoCode) :
							flagsDirectory + d.isoCode + ".png";
					});

				const labelLineDonors = labelsGroupDonorsEnter.append("polyline")
					.style("stroke-width", "1px")
					.style("stroke", "#ccc")
					.style("fill", "none")
					.attr("points", function(d) {
						return (xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + 5) + ",0"
					});

				labelsGroupDonors = labelsGroupDonorsEnter.merge(labelsGroupDonors);

				if (chartState.showLocal) {
					labelsGroupDonors.append("text")
						.attr("class", "pbicliLabelTextSmall")
						.attr("x", 2 + flagSize)
						.attr("y", 2)
						.style("fill", function(d) {
							return d.currency === "USD" ? "#666" : "#E56A54";
						})
						.text(function(d) {
							return "(" + d.currency + ")";
						});
				};

				if (!chartState.showLocal) labelsGroupDonors.select("text").remove();

				labelsGroupDonors.raise();

				collideLabels(labelsGroupDonors.data(), donorsLinesPanel.height - donorsLinesPanel.padding[2]);

				labelsGroupDonors = labelsGroupDonors.sort(function(a, b) {
					return b.yPos - a.yPos;
				});

				labelsGroupDonors.transition()
					.duration(duration)
					.style("opacity", 1)
					.attr("transform", function(d) {
						return "translate(" + (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding) + "," +
							d.yPos + ")";
					});

				labelsGroupDonors.select("polyline")
					.style("opacity", 0)
					.transition()
					.duration(0)
					.attr("points", function(d, i, n) {
						const step = ((donorsLinesPanel.width - donorsLinesPanel.padding[1]) - xScaleDonors(parseTime(d.datum.year))) / n.length;
						if (d.currency === "USD") {
							return (xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding / 2)) +
								"," + (yScaleDonors(d.datum.total) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + (yScaleDonors(d.datum.total) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + 0 + " " +
								-labelDistance + "," + 0;
						} else {
							return (xScaleDonors(parseTime(d.datum.year)) - (donorsLinesPanel.width - donorsLinesPanel.padding[1] + labelPadding / 2)) +
								"," + (yScaleDonorsLocalCurrency(d.datum.localTotal) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + (yScaleDonorsLocalCurrency(d.datum.localTotal) - d.yPos) + " " +
								-(i * step + (labelPadding / 2)) + "," + 0 + " " +
								-labelDistance + "," + 0;
						};
					})
					.on("end", function() {
						d3.select(this).style("opacity", 1);
					});

				labelsGroupDonors.on("mouseover", function(d) {
						const selectedGroups = chartState.showLocal ? ".pbicliDonorsGroup, .pbicliDonorsGroupLocal, .pbicliLabelsGroupDonors" :
							".pbicliDonorsGroup, .pbicliLabelsGroupDonors";
						donorsLinesPanel.main.selectAll(selectedGroups)
							.style("opacity", function(e) {
								return d.isoCode === e.isoCode ? 1 : fadeOpacity;
							});
					})
					.on("mouseout", function() {
						const selectedGroups = chartState.showLocal ? ".pbicliDonorsGroup, .pbicliDonorsGroupLocal, .pbicliLabelsGroupDonors" :
							".pbicliDonorsGroup, .pbicliLabelsGroupDonors";
						donorsLinesPanel.main.selectAll(selectedGroups)
							.style("opacity", 1);
					});

				groupXAxisDonors.transition()
					.duration(duration)
					.call(xAxisDonors);

				groupYAxisDonors.transition()
					.duration(duration)
					.call(yAxisDonors);

				groupYAxisDonors.select(".domain").raise();

				groupYAxisDonorsLocalCurrency.transition()
					.duration(duration)
					.style("opacity", chartState.showLocal ? 1 : 0)
					.call(yAxisDonorsLocalCurrency);

				yAxisLabelDonorsLocalCurrency.text(chartState.showLocal ? chartState.selectedLocalCurrency : "");

				groupYAxisDonors.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				groupYAxisDonorsLocalCurrency.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				let rectOverlayDonors = donorsLinesPanel.main.selectAll(".pbicliRectOverlayDonors")
					.data([true]);

				rectOverlayDonors = rectOverlayDonors.enter()
					.append("rect")
					.attr("class", "pbicliRectOverlayDonors")
					.attr("x", donorsLinesPanel.padding[3])
					.attr("y", donorsLinesPanel.padding[0])
					.attr("height", donorsLinesPanel.height - donorsLinesPanel.padding[0] - donorsLinesPanel.padding[2])
					.attr("width", donorsLinesPanel.width - donorsLinesPanel.padding[1] - donorsLinesPanel.padding[3])
					.style("fill", "none")
					.attr("pointer-events", "all")
					.merge(rectOverlayDonors)
					.on("mousemove", function() {
						if (chartState.showLocal) {
							mouseMoveRectOverlay("donor", donorsLinesPanel, donorsData.concat(donorsDataLocal), xScaleDonors, yScaleDonors);
						} else {
							mouseMoveRectOverlay("donor", donorsLinesPanel, donorsData, xScaleDonors, yScaleDonors);
						};
					})
					.on("mouseout", function() {
						mouseOutRectOverlay(donorsLinesPanel);
					});

				rectOverlayDonors.raise();

				//end of createDonorsLines
			};

			function createCbpfsLines(cbpfsDataOriginal) {

				const cbpfsData = cbpfsDataOriginal.filter(function(d) {
					return checkedCbpfs[d.isoCode];
				});

				const xAxisCbpfsRightMargin = xScaleCbpfs(xScaleCbpfs.domain()[1]) -
					xScaleCbpfs(d3.timeMonth.offset(xScaleCbpfs.domain()[1], -monthsMargin));

				cbpfsPanelClipPaths.attr("width", cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] - cbpfsLinesPanel.padding[3] -
					xAxisCbpfsRightMargin + 1);

				cbpfsPanelClipCircles.attr("width", cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] - cbpfsLinesPanel.padding[3] -
					xAxisCbpfsRightMargin + circleRadius);

				futureDonationsGroupCbpfs.style("opacity", chartState.futureDonations ? 1 : 0)
					.attr("transform", "translate(" + xScaleCbpfs(parseTime(currentYear)) + ",0)");

				const cbpfsGroup = cbpfsLinesPanel.main.selectAll(".pbicliCbpfsGroup")
					.data(cbpfsData, function(d) {
						return d.isoCode
					});

				const cbpfsGroupExit = cbpfsGroup.exit().remove();

				const cbpfsGroupEnter = cbpfsGroup.enter()
					.append("g")
					.attr("class", "pbicliCbpfsGroup");

				const cbpfsPath = cbpfsGroupEnter.append("path")
					.attr("class", "pbicliCbpfsPath")
					.attr("clip-path", "url(#pbicliCbpfsPanelClipPaths)")
					.style("stroke-dasharray", 0)
					.attr("d", function(d) {
						return lineGeneratorCbpfs(d.values)
					})
					.each(function() {
						localVariable.set(this, this.getTotalLength())
					});

				cbpfsPath.style("stroke-dasharray", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength + " " + thisPathLength;
					})
					.style("stroke-dashoffset", function() {
						const thisPathLength = localVariable.get(this);
						return thisPathLength;
					})
					.transition()
					.duration(duration)
					.style("stroke-dashoffset", 0);

				const circlesEnter = cbpfsGroupEnter.selectAll(null)
					.data(function(d) {
						return d.values;
					})
					.enter()
					.append("circle")
					.attr("class", "pbicliCbpfsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					})
					.attr("clip-path", "url(#pbicliCbpfsPanelClipCircles)")
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				cbpfsGroup.select("path")
					.transition()
					.duration(duration)
					.style("stroke-dasharray", null)
					.attr("d", function(d) {
						return lineGeneratorCbpfs(d.values)
					});

				const updateCircles = cbpfsGroup.selectAll("circle")
					.data(function(d) {
						return d.values;
					});

				const updateCirclesExit = updateCircles.exit().remove();

				const updateCirclesEnter = updateCircles.enter()
					.append("circle")
					.attr("class", "pbicliCbpfsCircles")
					.attr("r", 0)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					})
					.attr("clip-path", "url(#pbicliCbpfsPanelClipCircles)")
					.each(function(d) {
						d.donor = d3.select(this.parentNode).datum().donor;
					})
					.transition()
					.delay(function(_, i, n) {
						return i * (duration / n.length);
					})
					.duration(duration / 4)
					.attr("r", circleRadius);

				updateCircles.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleCbpfs(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleCbpfs(d.total)
					});

				const labelsData = cbpfsData.map(function(d) {
					let thisDatum;
					if (chartState.futureDonations) {
						thisDatum = d.values[d.values.length - 1];
					} else {
						const filteredValue = d.values.filter(function(e) {
							return e.year <= currentYear.toString();
						});
						thisDatum = filteredValue[filteredValue.length - 1];
					};
					return {
						name: isoAlpha2to3[d.isoCode.toUpperCase()],
						datum: thisDatum,
						yPos: yScaleCbpfs(thisDatum.total),
						isoCode: d.isoCode
					}
				});

				let labelsGroupCbpfs = cbpfsLinesPanel.main.selectAll(".pbicliLabelsGroupCbpfs")
					.data(labelsData, function(d) {
						return d.name;
					});

				const labelsGroupCbpfsExit = labelsGroupCbpfs.exit().remove();

				const labelsGroupCbpfsEnter = labelsGroupCbpfs.enter()
					.append("g")
					.attr("class", "pbicliLabelsGroupCbpfs")
					.style("opacity", 0);

				labelsGroupCbpfsEnter.attr("transform", function(d) {
					return "translate(" + (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + "," +
						d.yPos + ")";
				});

				labelsGroupCbpfsEnter.append("text")
					.attr("class", "pbicliLabelText")
					.attr("y", 4)
					.text(function(d) {
						return d.name;
					});

				const labelLineCbpfs = labelsGroupCbpfsEnter.append("polyline")
					.style("stroke-width", "1px")
					.style("stroke", "#ccc")
					.style("fill", "none")
					.attr("points", function(d) {
						return (xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0 " +
							(xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + 5) + ",0"
					});

				labelsGroupCbpfs = labelsGroupCbpfsEnter.merge(labelsGroupCbpfs);

				collideLabels(labelsGroupCbpfs.data(), cbpfsLinesPanel.height - cbpfsLinesPanel.padding[2]);

				labelsGroupCbpfs.raise();

				labelsGroupCbpfs = labelsGroupCbpfs.sort(function(a, b) {
					return b.yPos - a.yPos;
				});

				labelsGroupCbpfs.transition()
					.duration(duration)
					.style("opacity", 1)
					.attr("transform", function(d) {
						return "translate(" + (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding) + "," +
							d.yPos + ")";
					});

				labelsGroupCbpfs.select("polyline")
					.style("opacity", 0)
					.transition()
					.duration(0)
					.attr("points", function(d, i, n) {
						const step = ((cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1]) - xScaleCbpfs(parseTime(d.datum.year))) / n.length;
						return (xScaleCbpfs(parseTime(d.datum.year)) - (cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] + labelPadding / 2)) +
							"," + (yScaleCbpfs(d.datum.total) - d.yPos) + " " +
							-(i * step + (labelPadding / 2)) + "," + (yScaleCbpfs(d.datum.total) - d.yPos) + " " +
							-(i * step + (labelPadding / 2)) + "," + 0 + " " +
							-labelDistance + "," + 0;
					})
					.on("end", function() {
						d3.select(this).style("opacity", 1);
					});

				labelsGroupCbpfs.on("mouseover", function(d, i) {
						cbpfsLinesPanel.main.selectAll(".pbicliCbpfsGroup, .pbicliLabelsGroupCbpfs")
							.style("opacity", function(e) {
								return d.isoCode === e.isoCode ? 1 : fadeOpacity;
							})
					})
					.on("mouseout", function() {
						cbpfsLinesPanel.main.selectAll(".pbicliCbpfsGroup, .pbicliLabelsGroupCbpfs")
							.style("opacity", 1);
					});

				groupXAxisCbpfs.transition()
					.duration(duration)
					.call(xAxisCbpfs);

				groupYAxisCbpfs.transition()
					.duration(duration)
					.call(yAxisCbpfs);

				groupYAxisCbpfs.select(".domain").raise();

				groupYAxisCbpfs.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				let rectOverlayCbpfs = cbpfsLinesPanel.main.selectAll(".pbicliRectOverlayCbpfs")
					.data([true]);

				rectOverlayCbpfs = rectOverlayCbpfs.enter()
					.append("rect")
					.attr("class", "pbicliRectOverlayCbpfs")
					.attr("x", cbpfsLinesPanel.padding[3])
					.attr("y", cbpfsLinesPanel.padding[0])
					.attr("height", cbpfsLinesPanel.height - cbpfsLinesPanel.padding[0] - cbpfsLinesPanel.padding[2])
					.attr("width", cbpfsLinesPanel.width - cbpfsLinesPanel.padding[1] - cbpfsLinesPanel.padding[3])
					.style("fill", "none")
					.attr("pointer-events", "all")
					.merge(rectOverlayCbpfs)
					.on("mousemove", function() {
						mouseMoveRectOverlay("cbpf", cbpfsLinesPanel, cbpfsData, xScaleCbpfs, yScaleCbpfs);
					})
					.on("mouseout", function() {
						mouseOutRectOverlay(cbpfsLinesPanel);
					});

				rectOverlayCbpfs.raise();

				//end of createCbpfsLines
			};

			function mouseMoveRectOverlay(type, thisPanel, thisOriginalData, xScale, yScale) {

				if (!thisOriginalData.length) return;

				const spanClass = type === "donor" ? "contributionColorHTMLcolor" : "allocationColorHTMLcolor";

				const thisWidth = type === "donor" ? 290 : 250;

				const mouse = d3.mouse(thisPanel.main.node());

				const mouseYear = d3.timeMonth.offset(xScale.invert(mouse[0]), 6).getFullYear().toString();

				const thisData = [];

				thisOriginalData.forEach(function(country) {
					const localCurrency = country.localCurrency === undefined ? false : country.localData ? country.localCurrency : "USD";
					const localData = !!country.localData;
					const thisYear = country.values.find(function(e) {
						return e.year === mouseYear;
					});
					if (thisYear && thisYear.total > 0) {
						thisData.push({
							name: country.isoCode,
							total: localData ? thisYear.localTotal : thisYear.total,
							year: mouseYear,
							type: type,
							local: localData,
							localCurrency: localCurrency
						})
					};
				});

				thisData.sort(function(a, b) {
					return b.total - a.total;
				});

				if (thisData.length) {

					const typeTitle = thisData.length > 1 ?
						type.charAt(0).toUpperCase() + type.slice(1) + "s" :
						type.charAt(0).toUpperCase() + type.slice(1);

					let tooltipHtml = "<span style='margin-bottom:-8px;display:block;'>" + typeTitle + " in <strong>" + mouseYear +
						"</strong>:</span><br><div style='margin:0px;display:flex;flex-wrap:wrap;align-items:flex-end;width:" + thisWidth + "px;'>";

					for (let i = 0; i < thisData.length; i++) {
						const currency = type === "donor" && chartState.showLocal ? " (" + thisData[i].localCurrency + ")" : "";
						tooltipHtml += "<div style='display:flex;flex:0 60%;'>&bull; " +
							iso2Names[thisData[i].name] + currency + ":</div><div style='display:flex;flex:0 40%;justify-content:flex-end;'><span class='" +
							spanClass + "'>$" + formatMoney0Decimals(thisData[i].total) +
							"</span></div>"
					};

					tooltipHtml += "</div>";

					const tooltipGroup = thisPanel.main.selectAll(".pbicliTooltipGroup")
						.data([true]);

					const tooltipGroupEnter = tooltipGroup.enter()
						.append("g")
						.attr("class", "pbicliTooltipGroup")
						.attr("pointer-events", "none");

					const circles = tooltipGroup.selectAll(".pbicliTooltipCircles")
						.data(thisData, function(d) {
							return d.name
						});

					const circlesExit = circles.exit().remove();

					const circlesEnter = circles.enter()
						.append("circle")
						.attr("class", "pbicliTooltipCircles")
						.attr("r", circleRadius + 2)
						.style("fill", "none")
						.style("stroke", function(d) {
							if (type === "cbpf") {
								return "#eca154"
							} else {
								return d.local ? "E56A54" : "418fde"
							};
						})
						.merge(circles)
						.attr("cx", function(d) {
							return xScale(parseTime(d.year))
						})
						.attr("cy", function(d) {
							return d.local ? yScaleDonorsLocalCurrency(d.total) : yScale(d.total);
						});

					const lines = tooltipGroup.selectAll(".pbicliTooltipLines")
						.data(thisData, function(d) {
							return d.name
						});

					const linesExit = lines.exit().remove();

					const linesEnter = lines.enter()
						.append("line")
						.attr("class", "pbicliTooltipLines")
						.style("stroke-dasharray", "1,1")
						.style("stroke-width", "1px")
						.style("stroke", "#222")
						.merge(lines)
						.attr("x1", function(d) {
							return xScale(parseTime(d.year)) - circleRadius - 2;
						})
						.attr("x2", thisPanel.padding[3])
						.attr("y1", function(d) {
							return d.local ? yScaleDonorsLocalCurrency(d.total) : yScale(d.total);
						})
						.attr("y2", function(d) {
							return d.local ? yScaleDonorsLocalCurrency(d.total) : yScale(d.total);
						});

					tooltip.style("display", "block");

					const tooltipSize = tooltip.node().getBoundingClientRect();

					tooltip.html(tooltipHtml)
						.style("top", d3.event.pageY - (tooltipSize.height / 2) + "px")
						.style("left", mouse[0] > thisPanel.width - 16 - tooltipSize.width && type === "cbpf" ?
							d3.event.pageX - tooltipSize.width - 16 + "px" :
							d3.event.pageX + 16 + "px");

				} else {

					tooltip.style("display", "none");
					thisPanel.main.select(".pbicliTooltipGroup").remove();

				};

				//end of mouseOverRectOverlay
			};

			function mouseOutRectOverlay(thisPanel) {
				tooltip.style("display", "none");
				thisPanel.main.select(".pbicliTooltipGroup").remove();
			};

			//end of draw
		};

		function createTitle() {

			borderDiv.style("border-bottom", "1px solid lightgray");

			const title = titleDiv.append("p")
				.attr("class", "pbicliTitle contributionColorHTMLcolor")
				.html("Contributions Line Chart");

			const helpIcon = iconsDiv.append("button")
				.attr("id", "pbicliHelpButton")
				.style("font-size", "0.8vw")
				.html("HELP ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "pbicliDownloadButton")
				.style("font-size", "0.8vw")
				.html(".CSV ")
				.append("span")
				.attr("class", "fas fa-download");

			//end of createTitle
		};

		function createDonorsDropdown(donorsArray) {

			const dropdownData = ["Select an option", "Top 5 donors"].concat(donorsArray);

			const label = donorsSelectionDiv.append("p")
				.attr("class", "pbicliDropdownLabel")
				.html("DONOR:");

			const select = donorsSelectionDiv.append("select")
				.attr("id", "pbicliDonorsDropdown");

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("disabled", function(_, i) {
					return !i;
				})
				.property("selected", function(_, i) {
					return !i;
				})
				.html(function(d, i) {
					return i < 2 ? d : iso2Names[d];
				});

			//end of createDonorsDropdown
		};

		function changeDonorsDropdown(donorsArray, all) {

			const dropdownData = all ? ["Select an option", "Top 5 donors"].concat(donorsArray) :
				["Select an option"].concat(donorsArray);

			const select = donorsSelectionDiv.select("select");

			select.selectAll("option").remove();

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("disabled", function(_, i) {
					return !i;
				})
				.property("selected", function(_, i) {
					return !i;
				})
				.html(function(d, i) {
					return all ? i < 2 ? d : iso2Names[d] : i < 1 ? d : iso2Names[d];
				});

			//end of changeDonorsDropdown
		};

		function createCurrencyDropdown(dropdownData) {

			const currencyLabel = donorsSelectionDiv.append("p")
				.attr("class", "pbicliDropdownLabel")
				.html("CURRENCY:");

			const select = donorsSelectionDiv.append("select")
				.attr("id", "pbicliCurrencyDropdown");

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("selected", function(_, i) {
					return !i;
				})
				.html(function(d) {
					return d === "USD" ? "USD (all donors)" : d;
				});

			//end of createCurrencyDropdown
		};

		function createCbpfsDropdown(cbpfsArray) {

			const dropdownData = ["Select an option", "Top 5 CBPFs"].concat(cbpfsArray);

			const label = cbpfsSelectionDiv.append("p")
				.attr("class", "pbicliDropdownLabel")
				.html("CBPF:");

			const select = cbpfsSelectionDiv.append("select")
				.attr("id", "pbicliCbpfsDropdown");

			const options = select.selectAll(null)
				.data(dropdownData)
				.enter()
				.append("option")
				.property("disabled", function(_, i) {
					return !i;
				})
				.property("selected", function(_, i) {
					return !i;
				})
				.html(function(d, i) {
					return i < 2 ? d : iso2Names[d];
				});

			//end of createCbpfsDropdown
		};

		function createFilters() {

			const dataFilters = ["Show USD", "Show local currency"];

			const radio = filtersDiv.selectAll(null)
				.data(dataFilters)
				.enter()
				.append("label")
				.attr("class", "pbicliRadioButtons")
				.style("cursor", "pointer");

			radio.append("input")
				.attr("type", "radio")
				.attr("name", "pbicliradiobutton")
				.attr("value", function(_, i) {
					return i ? "local" : "usd";
				})
				.property("checked", function(_, i) {
					return !i;
				});

			radio.append("span")
				.attr("class", "pbicliRadioLabel")
				.text(function(d) {
					return d;
				});

			const checkbox = filtersDiv.append("label")
				.attr("class", "pbicliCheckbox")
				.style("cursor", "pointer");

			checkbox.append("input")
				.attr("type", "checkbox")
				.property("checked", chartState.futureDonations);

			checkbox.append("span")
				.attr("class", "pbicliRadioLabel")
				.text("Show future (pledged) donations");

			//end of createFilters
		};

		function createTopLegend() {

			const donorsText = chartState.selectedDonors.length > 1 ? "donors" : "donor";

			const cbpfsText = chartState.selectedCbpfs.length > 1 ? "CBPFs" : "CBPF";

			let donorsTopLegend = donorsLegendDivTop.selectAll(".pbicliDonorsTopLegend")
				.data([true]);

			donorsTopLegend = donorsTopLegend.enter()
				.append("p")
				.attr("class", "pbicliDonorsTopLegend")
				.merge(donorsTopLegend)
				.html(chartState.controlledBy !== "cbpf" ? "Selected " + donorsText + ":" : "Donors ");

			if (chartState.controlledBy === "cbpf") {
				donorsTopLegend.append("span")
					.attr("class", "pbicliDonorsTopLegendSubtext")
					.html("&rarr; shows donors that donated to the selected " + cbpfsText + ". Click to show/hide:")
			};

			let cbpfsTopLegend = cbpfsLegendDivTop.selectAll(".pbicliCbpfsTopLegend")
				.data([true]);

			cbpfsTopLegend = cbpfsTopLegend.enter()
				.append("p")
				.attr("class", "pbicliCbpfsTopLegend")
				.merge(cbpfsTopLegend)
				.html(chartState.controlledBy !== "donor" ? "Selected " + cbpfsText + ":" : "CBPFs ");

			if (chartState.controlledBy === "donor") {
				cbpfsTopLegend.append("span")
					.attr("class", "pbicliCbpfsTopLegendSubtext")
					.html("&rarr; shows CBPFs that received from the selected " + donorsText + ". Click to show/hide:")
			};

			//end of createTopLegend
		};

		function createFooterDiv() {

			const footerText = "© OCHA CBPF Section " + currentYear + " | For more information, please visit ";

			const footerLink = "<a href='https://gms.unocha.org/content/cbpf-contributions'>gms.unocha.org/bi</a>";

			footerDiv.append("div")
				.attr("class", "pbicliFooterText")
				.html(footerText + footerLink + ".");

			//end of createFooterDiv
		};

		function processList(rawData) {

			const data = {
				yearsArray: [],
				currenciesArray: [],
				donorsArray: [],
				cbpfsArray: []
			};

			const dataColumns = {
				yearsArray: "FiscalYear",
				currenciesArray: "PaidAmtLocalCurrency",
				donorsArray: "GMSDonorISO2Code",
				cbpfsArray: "PooledFundISO2Code"
			};

			const totals = {
				donorsTotals: {},
				cbpfsTotals: {}
			};

			rawData.forEach(function(row) {

				//REMOVE THIS
				if (row.GMSDonorISO2Code === "NO") row.PaidAmtLocalCurrency = "NOK";
				//REMOVE THIS

				row.GMSDonorISO2Code = row.GMSDonorISO2Code.toLowerCase();

				row.PooledFundISO2Code = row.PooledFundISO2Code.toLowerCase();

				Object.keys(data).forEach(function(key) {
					if (data[key].indexOf(row[dataColumns[key]].trim()) === -1) {
						if (row[dataColumns[key]] !== "") data[key].push(row[dataColumns[key]].trim());
					};
				});

				if (!currencyByCountry[row.GMSDonorISO2Code]) currencyByCountry[row.GMSDonorISO2Code] = row.PaidAmtLocalCurrency.trim();

				if (!iso2Names[row.GMSDonorISO2Code]) iso2Names[row.GMSDonorISO2Code] = row.GMSDonorName;

				if (!iso2Names[row.PooledFundISO2Code]) iso2Names[row.PooledFundISO2Code] = row.PooledFundName;

				if (!checkedDonors[row.GMSDonorISO2Code]) checkedDonors[row.GMSDonorISO2Code] = true;

				if (!checkedCbpfs[row.PooledFundISO2Code]) checkedCbpfs[row.PooledFundISO2Code] = true;

				if (totals.donorsTotals[row.GMSDonorISO2Code] === undefined) {
					totals.donorsTotals[row.GMSDonorISO2Code] = 0;
				} else {
					totals.donorsTotals[row.GMSDonorISO2Code] += +row.PaidAmt;
				};

				if (totals.cbpfsTotals[row.PooledFundISO2Code] === undefined) {
					totals.cbpfsTotals[row.PooledFundISO2Code] = 0;
				} else {
					totals.cbpfsTotals[row.PooledFundISO2Code] += +row.PaidAmt;
				};

			});

			iso2Names.mk = "Macedonia";

			data.yearsArray.sort(function(a, b) {
				return +a - +b;
			});

			data.currenciesArray.sort();

			const usdIndex = data.currenciesArray.indexOf("USD");

			data.currenciesArray.splice(usdIndex, 1);

			data.currenciesArray.unshift("USD");

			data.donorsArray.sort(function(a, b) {
				return totals.donorsTotals[b] - totals.donorsTotals[a];
			});

			data.cbpfsArray.sort(function(a, b) {
				return totals.cbpfsTotals[b] - totals.cbpfsTotals[a];
			});

			return data;

			//end of processList
		};

		function populateData(rawData) {

			const data = {
				donors: [],
				cbpfs: []
			};

			const target = chartState.controlledBy === "donor" ? "GMSDonorISO2Code" : "PooledFundISO2Code";

			const selectionList = chartState.controlledBy === "donor" ? chartState.selectedDonors : chartState.selectedCbpfs;

			rawData.forEach(function(row) {

				if (selectionList.indexOf(row[target]) > -1) {

					const foundDonor = data.donors.find(function(e) {
						return e.donor === row.GMSDonorName;
					});

					const foundCbpf = data.cbpfs.find(function(e) {
						return e.cbpf === row.PooledFundName;
					});

					if (foundDonor) {

						const foundValue = foundDonor.values.find(function(e) {
							return e.year === row.FiscalYear;
						});

						if (foundValue) {
							foundValue.paid += +row.PaidAmt;
							foundValue.pledge += +row.PledgeAmt;
							foundValue.total += (+row.PaidAmt) + (+row.PledgeAmt);
							foundValue.localPaid += +row.PaidAmtLocal;
							foundValue.localPledge += +row.PledgeAmtLocal;
							foundValue.localTotal += (+row.PaidAmtLocal) + (+row.PledgeAmtLocal);
						} else {
							foundDonor.values.push({
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							});
						};

						foundDonor.total += (+row.PaidAmt) + (+row.PledgeAmt);

					} else {

						data.donors.push({
							donor: row.GMSDonorName,
							isoCode: row.GMSDonorISO2Code,
							localCurrency: row.PaidAmtLocalCurrency.trim(),
							total: (+row.PaidAmt) + (+row.PledgeAmt),
							values: [{
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							}]
						});

					};

					if (foundCbpf) {

						const foundValue = foundCbpf.values.find(function(e) {
							return e.year === row.FiscalYear;
						});

						if (foundValue) {
							foundValue.paid += +row.PaidAmt;
							foundValue.pledge += +row.PledgeAmt;
							foundValue.total += (+row.PaidAmt) + (+row.PledgeAmt);
							foundValue.localPaid += +row.PaidAmtLocal;
							foundValue.localPledge += +row.PledgeAmtLocal;
							foundValue.localTotal += (+row.PaidAmtLocal) + (+row.PledgeAmtLocal);
						} else {
							foundCbpf.values.push({
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							});
						};

						foundCbpf.total += (+row.PaidAmt) + (+row.PledgeAmt);

					} else {

						data.cbpfs.push({
							cbpf: row.PooledFundName,
							isoCode: row.PooledFundISO2Code.toLowerCase(),
							total: (+row.PaidAmt) + (+row.PledgeAmt),
							values: [{
								year: row.FiscalYear,
								paid: +row.PaidAmt,
								pledge: +row.PledgeAmt,
								total: (+row.PaidAmt) + (+row.PledgeAmt),
								localPaid: +row.PaidAmtLocal,
								localPledge: +row.PledgeAmtLocal,
								localTotal: (+row.PaidAmtLocal) + (+row.PledgeAmtLocal)
							}]
						});

					};

				};

			});

			data.donors.forEach(function(donor) {
				fillZeros(donor.values);
			});

			data.cbpfs.forEach(function(cbpf) {
				fillZeros(cbpf.values);
			});

			function fillZeros(valuesArray) {
				if (valuesArray.length === 1) {
					const onlyYear = +valuesArray[0].year;
					[onlyYear - 1, onlyYear + 1].forEach(function(year) {
						valuesArray.push({
							year: year.toString(),
							paid: 0,
							pledge: 0,
							total: 0,
							localPaid: 0,
							localPledge: 0,
							localTotal: 0
						})
					});
					valuesArray.sort(function(a, b) {
						return (+a.year) - (+b.year);
					});
				} else {
					const firstYear = valuesArray[0].year;
					const lastYear = valuesArray[valuesArray.length - 1].year;
					const thisRange = d3.range(+firstYear, +lastYear, 1);
					thisRange.forEach(function(rangeYear) {
						const foundYear = valuesArray.find(function(e) {
							return e.year === rangeYear.toString();
						});
						if (!foundYear) {
							valuesArray.push({
								year: rangeYear.toString(),
								paid: 0,
								pledge: 0,
								total: 0,
								localPaid: 0,
								localPledge: 0,
								localTotal: 0
							});
						};
					});
					valuesArray.sort(function(a, b) {
						return (+a.year) - (+b.year);
					});
				};
			};

			return data;

			//end of populateData
		};

		function collideLabels(dataArray, maxValue, minValue) {

			if (dataArray.length < 2) return;

			dataArray.sort(function(a, b) {
				return b.yPos - a.yPos;
			});

			for (let i = 0; i < dataArray.length - 1; i++) {
				if (!isColliding(dataArray[i], dataArray[i + 1])) continue;
				while (isColliding(dataArray[i], dataArray[i + 1])) {
					if (i === 0) {
						dataArray[i].yPos = Math.min(maxValue, dataArray[i].yPos + 1);
						dataArray[i + 1].yPos -= 1;
					} else {
						dataArray[i + 1].yPos -= 1;
					};
				};
			};

			dataArray.forEach(function(_, i, arr) {
				if (arr[i + 1]) {
					if (arr[i + 1].yPos > arr[i].yPos - labelGroupHeight) {
						collideLabels(dataArray, maxValue, minValue);
					};
				};
			});

			function isColliding(objA, objB) {
				return !((objA.yPos + labelGroupHeight) < objB.yPos ||
					objA.yPos > (objB.yPos + labelGroupHeight));
			};

			//end of collideLabels
		};

		function setTimeExtent(yearsArray) {

			if (!chartState.futureDonations) {
				yearsArray = yearsArray.filter(function(d) {
					return d <= currentYear;
				});
			};

			const timeExtent = d3.extent(yearsArray.map(function(d) {
				return parseTime(d);
			}));

			timeExtent[0] = d3.timeMonth.offset(timeExtent[0], -monthsMargin);

			timeExtent[1] = d3.timeMonth.offset(timeExtent[1], monthsMargin);

			return timeExtent;

			//end of setTimeExtent
		};

		function setYDomain(donors, cbpfs) {

			const maxDonors = d3.max(donors, function(donor) {
				return d3.max(donor.values, function(d) {
					if (!chartState.futureDonations && +d.year > +currentYear) {
						return 0;
					} else {
						return d.total;
					};
				});
			});

			const maxCbpfs = d3.max(cbpfs, function(cbpf) {
				return d3.max(cbpf.values, function(d) {
					if (!chartState.futureDonations && +d.year > +currentYear) {
						return 0;
					} else {
						return d.total;
					};
				});
			});

			if (maxDonors === undefined && maxCbpfs === undefined) return [0, defaultYMaxValue];

			return [0, Math.max(maxDonors || 0, maxCbpfs || 0) * 1.05];

			//end of setYDomain
		};

		function setYDomainLocalCurrency(donors) {

			const maxDonors = d3.max(donors, function(donor) {
				return d3.max(donor.values, function(d) {
					if (!chartState.futureDonations && +d.year > +currentYear) {
						return 0;
					} else {
						return d.localTotal;
					};
				});
			});

			return [0, maxDonors * 1.05];

			//end of setYDomainLocalCurrency
		};

		function createCurrencyOverDiv() {

			const overDiv = containerDiv.append("div")
				.attr("class", "pbicliOverDiv");

			const alertDiv = overDiv.append("div")
				.attr("id", "pbiclialertdiv");

			alertDiv.append("div")
				.html("All donor countries must have the same currency for choosing “local currency”. Do you wish to clear the current selection?");

			const yesOrNoContainer = alertDiv.append("div")
				.attr("class", "pbiclialertdivcontainer");

			const yesOrNoDivs = yesOrNoContainer.selectAll(null)
				.data(["YES", "NO"])
				.enter()
				.append("div")
				.attr("class", "pbiclialertyesorno")
				.html(function(d) {
					return d;
				});

			//end of createCurrencyOverDiv
		};

		function createCurrencyOverDiv2() {

			const overDiv = containerDiv.append("div")
				.attr("class", "pbicliOverDiv");

			const alertDiv = overDiv.append("div")
				.attr("id", "pbiclialertdiv");

			alertDiv.append("div")
				.html("Please select a donor with the same local currency of the previously selected donors<br><br>(click anywhere to close)");

			overDiv.on("click", function() {
				overDiv.remove();
			});

			//end of createCurrencyOverDiv
		};

		function createAnnotationsDiv() {

			const overDiv = containerDiv.append("div")
				.attr("class", "pbicliOverDivHelp");

			const totalWidth = overDiv.node().clientWidth;

			const totalHeight = overDiv.node().clientHeight;

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + totalWidth + " " + totalHeight);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbicliArrowMarker")
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 0)
				.attr("refY", 0)
				.attr("markerWidth", 12)
				.attr("markerHeight", 12)
				.attr("orient", "auto")
				.append("path")
				.style("fill", "#E56A54")
				.attr("d", "M0,-5L10,0L0,5");

			const mainText = helpSVG.append("text")
				.attr("class", "pbicliAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", totalWidth / 2)
				.attr("y", 280)
				.text("CLICK ANYWHERE TO START");

			const donorsDropdownAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 250)
				.attr("y", 130)
				.text("Use this menu to select one or more donors. When the donors are selected here, all CBPFs show values corresponding to donations made by those selected donors only.")
				.call(wrapText2, 200);

			const donorsDropdownPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M240,140 Q180,140 180,90");

			const cbpfsDropdownAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 650)
				.attr("y", 130)
				.text("Use this menu to select one or more CBPFs. When the CBPFs are selected here, all donors show values corresponding to donations made to those selected CBPFs only.")
				.call(wrapText2, 200);

			const cbpfsDropdownPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M640,140 Q580,140 580,90");

			const radioAnnotation = helpSVG.append("text")
				.attr("class", "pbicliAnnotationText")
				.attr("x", 220)
				.attr("y", 350)
				.text("Use these buttons to show the donations in USD or in the donor's local currency. This option is not available when CBPFs are selected, and also depend on the selected donors.")
				.call(wrapText2, 300);

			const radioPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbicliArrowMarker)")
				.attr("d", "M210,370 Q120,320 90,115");

			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
		};

		function createCSV(sourceDataDonors, sourceDataCbpfs) {


			//end of createCSV
		};

		function saveFlags(donors) {

			const donorsList = donors.map(function(d) {
				return d;
			});

			donorsList.forEach(function(d) {
				getBase64FromImage("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/flags16/" + d + ".png", setLocal, null, d);
			});

			function getBase64FromImage(url, onSuccess, onError, isoCode) {
				const xhr = new XMLHttpRequest();

				xhr.responseType = "arraybuffer";
				xhr.open("GET", url);

				xhr.onload = function() {
					let base64, binary, bytes, mediaType;

					bytes = new Uint8Array(xhr.response);

					binary = [].map.call(bytes, function(byte) {
						return String.fromCharCode(byte);
					}).join('');

					mediaType = xhr.getResponseHeader('content-type');

					base64 = [
						'data:',
						mediaType ? mediaType + ';' : '',
						'base64,',
						btoa(binary)
					].join('');
					onSuccess(isoCode, base64);
				};

				xhr.onerror = onError;

				xhr.send();
			};

			function setLocal(isoCode, base64) {
				localStorage.setItem("storedFlag" + isoCode, base64);
			};

			//end of saveFlags
		};

		function calculateVw(width, value) {
			return ((value * 100) / width) + "vw";
		};

		function wrapText2(text, width) {
			text.each(function() {
				let text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1,
					y = text.attr("y"),
					x = text.attr("x"),
					dy = 0,
					tspan = text.text(null)
					.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", dy + "em");
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node()
						.getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan")
							.attr("x", x)
							.attr("y", y)
							.attr("dy", ++lineNumber * lineHeight + dy + "em")
							.text(word);
					}
				}
			});
		};

		function createProgressWheel() {
			const wheelGroup = svg.append("g")
				.attr("class", "d3chartwheelGroup")
				.attr("transform", "translate(" + width / 2 + "," + height / 4 + ")");

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text("Loading visualisation...");

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
			const wheelGroup = d3.select(".d3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

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

	//Math.log10

	Math.log10 = Math.log10 || function(x) {
		return Math.log(x) * Math.LOG10E;
	};

	//END OF POLYFILLS

	const isoAlpha2to3 = {
		AF: 'AFG',
		AX: 'ALA',
		AL: 'ALB',
		DZ: 'DZA',
		AS: 'ASM',
		AD: 'AND',
		AO: 'AGO',
		AI: 'AIA',
		AQ: 'ATA',
		AG: 'ATG',
		AR: 'ARG',
		AM: 'ARM',
		AW: 'ABW',
		AU: 'AUS',
		AT: 'AUT',
		AZ: 'AZE',
		BS: 'BHS',
		BH: 'BHR',
		BD: 'BGD',
		BB: 'BRB',
		BY: 'BLR',
		BE: 'BEL',
		BZ: 'BLZ',
		BJ: 'BEN',
		BM: 'BMU',
		BT: 'BTN',
		BO: 'BOL',
		BA: 'BIH',
		BW: 'BWA',
		BV: 'BVT',
		BR: 'BRA',
		VG: 'VGB',
		IO: 'IOT',
		BN: 'BRN',
		BG: 'BGR',
		BF: 'BFA',
		BI: 'BDI',
		KH: 'KHM',
		CM: 'CMR',
		CA: 'CAN',
		CV: 'CPV',
		KY: 'CYM',
		CF: 'CAF',
		TD: 'TCD',
		CL: 'CHL',
		CN: 'CHN',
		HK: 'HKG',
		MO: 'MAC',
		CX: 'CXR',
		CC: 'CCK',
		CO: 'COL',
		KM: 'COM',
		CG: 'COG',
		CD: 'COD',
		CK: 'COK',
		CR: 'CRI',
		CI: 'CIV',
		HR: 'HRV',
		CU: 'CUB',
		CY: 'CYP',
		CZ: 'CZE',
		DK: 'DNK',
		DJ: 'DJI',
		DM: 'DMA',
		DO: 'DOM',
		EC: 'ECU',
		EG: 'EGY',
		SV: 'SLV',
		GQ: 'GNQ',
		ER: 'ERI',
		EE: 'EST',
		ET: 'ETH',
		FK: 'FLK',
		FO: 'FRO',
		FJ: 'FJI',
		FI: 'FIN',
		FR: 'FRA',
		GF: 'GUF',
		PF: 'PYF',
		TF: 'ATF',
		GA: 'GAB',
		GM: 'GMB',
		GE: 'GEO',
		DE: 'DEU',
		GH: 'GHA',
		GI: 'GIB',
		GR: 'GRC',
		GL: 'GRL',
		GD: 'GRD',
		GP: 'GLP',
		GU: 'GUM',
		GT: 'GTM',
		GG: 'GGY',
		GN: 'GIN',
		GW: 'GNB',
		GY: 'GUY',
		HT: 'HTI',
		HM: 'HMD',
		VA: 'VAT',
		HN: 'HND',
		HU: 'HUN',
		IS: 'ISL',
		IN: 'IND',
		ID: 'IDN',
		IR: 'IRN',
		IQ: 'IRQ',
		IE: 'IRL',
		IM: 'IMN',
		IL: 'ISR',
		IT: 'ITA',
		JM: 'JAM',
		JP: 'JPN',
		JE: 'JEY',
		JO: 'JOR',
		KZ: 'KAZ',
		KE: 'KEN',
		KI: 'KIR',
		KP: 'PRK',
		KR: 'KOR',
		KW: 'KWT',
		KG: 'KGZ',
		LA: 'LAO',
		LV: 'LVA',
		LB: 'LBN',
		LS: 'LSO',
		LR: 'LBR',
		LY: 'LBY',
		LI: 'LIE',
		LT: 'LTU',
		LU: 'LUX',
		MK: 'MKD',
		MG: 'MDG',
		MW: 'MWI',
		MY: 'MYS',
		MV: 'MDV',
		ML: 'MLI',
		MT: 'MLT',
		MH: 'MHL',
		MQ: 'MTQ',
		MR: 'MRT',
		MU: 'MUS',
		YT: 'MYT',
		MX: 'MEX',
		FM: 'FSM',
		MD: 'MDA',
		MC: 'MCO',
		MN: 'MNG',
		ME: 'MNE',
		MS: 'MSR',
		MA: 'MAR',
		MZ: 'MOZ',
		MM: 'MMR',
		NA: 'NAM',
		NR: 'NRU',
		NP: 'NPL',
		NL: 'NLD',
		AN: 'ANT',
		NC: 'NCL',
		NZ: 'NZL',
		NI: 'NIC',
		NE: 'NER',
		NG: 'NGA',
		NU: 'NIU',
		NF: 'NFK',
		MP: 'MNP',
		NO: 'NOR',
		OM: 'OMN',
		PK: 'PAK',
		PW: 'PLW',
		PS: 'PSE',
		PA: 'PAN',
		PG: 'PNG',
		PY: 'PRY',
		PE: 'PER',
		PH: 'PHL',
		PN: 'PCN',
		PL: 'POL',
		PT: 'PRT',
		PR: 'PRI',
		QA: 'QAT',
		RE: 'REU',
		RO: 'ROU',
		RU: 'RUS',
		RW: 'RWA',
		BL: 'BLM',
		SH: 'SHN',
		KN: 'KNA',
		LC: 'LCA',
		MF: 'MAF',
		PM: 'SPM',
		VC: 'VCT',
		WS: 'WSM',
		SM: 'SMR',
		ST: 'STP',
		SA: 'SAU',
		SN: 'SEN',
		RS: 'SRB',
		SC: 'SYC',
		SL: 'SLE',
		SG: 'SGP',
		SK: 'SVK',
		SI: 'SVN',
		SB: 'SLB',
		SO: 'SOM',
		ZA: 'ZAF',
		GS: 'SGS',
		SS: 'SSD',
		ES: 'ESP',
		LK: 'LKA',
		SD: 'SDN',
		SR: 'SUR',
		SJ: 'SJM',
		SZ: 'SWZ',
		SE: 'SWE',
		CH: 'CHE',
		SY: 'SYR',
		TW: 'TWN',
		TJ: 'TJK',
		TZ: 'TZA',
		TH: 'THA',
		TL: 'TLS',
		TG: 'TGO',
		TK: 'TKL',
		TO: 'TON',
		TT: 'TTO',
		TN: 'TUN',
		TR: 'TUR',
		TM: 'TKM',
		TC: 'TCA',
		TV: 'TUV',
		UG: 'UGA',
		UA: 'UKR',
		AE: 'ARE',
		GB: 'GBR',
		US: 'USA',
		UM: 'UMI',
		UY: 'URY',
		UZ: 'UZB',
		VU: 'VUT',
		VE: 'VEN',
		VN: 'VNM',
		VI: 'VIR',
		WF: 'WLF',
		EH: 'ESH',
		YE: 'YEM',
		ZM: 'ZMB',
		ZW: 'ZWE'
	};

	//end of d3ChartIIFE
}());
