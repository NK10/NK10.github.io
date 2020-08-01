dataGDPMortality = []
sceneIndex = 0;
countryNameList = []
dataGDPMortality.push([])
dataGDPMortality.push([])
dataCountryGDpMortality = []
dataCountryGDpMortality.push([])
dataCountryGDpMortality.push([])
hoverIndex = 0

function getCountyNameList(data) {
    var countryList = Object.keys(data[0])
    for (var c1 = 2; c1 < countryList.length; c1++) {
        countryNameList.push(countryList[c1])
    }
}

function processPerCountryData(data, dataIndex) {
    var text = populateHoverText(dataIndex)

    var keys = Object.keys(data[0])
    var keyCount = 2;
    while (keyCount < keys.length) {
        keyDb = []
        for (count = 0; count < data.length; count++) {
            var Year = data[count].Year
            keyDb.push({
                "Year": Year, "Value": Number(data[count][keys[keyCount]]), "HoverText": text
            })
        }
        dataCountryGDpMortality[dataIndex].push(keyDb);
        keyCount++;
    }
}

function populateHoverText(dataIndex) {
    if (dataIndex == 1) {
        return "Mortality";
    } else {
        return "GDP Per Capita";
    }
}

function processDataSet(data, dataIndex) {
    var keys = Object.keys(data[0])
    var count = 0;
    var text = populateHoverText(dataIndex)
    while (count < data.length) {
        dataGDPMortality[dataIndex].push({
            "Year": data[count].Year, "Value": Number(data[count].World), "HoverText": text
        })
        count++;
    }
    processPerCountryData(data, dataIndex)
    if (dataIndex == 0) {
        getCountyNameList(data);
    }


}

async function init() {
    var newData = await d3.csv("https://nk10.github.io/World_Data.csv")
    processDataSet(newData, 0)
    newData = await d3.csv("https://nk10.github.io/Mortality_rate.csv")
    processDataSet(newData, 1)
    hoverIndex = 0
    showScene(dataGDPMortality[0])
}

function showScene(dataSet) {

    if(hoverIndex == 0)
    {
        dot_color="dot_orange";
        line_color = "line_orange";
        graphTitle ="GDP per capita vs Year"
    }
    else
    {
        dot_color="dot_blue";
        line_color = "line_blue";
        graphTitle ="Mortality vs Year"
    }
    d3.select("select")
        .on("change", loadFinalScene);
    d3.select("#radioButtonId")
        .on("change", loadFinalScene);
    d3.select("#chartBoxId")
        .select("svg").selectAll("g").remove();

    var xScale = d3.scaleLinear()
        .range([0, width])
        .domain([1990, 2018]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataSet, function (d) {
            return d.Value;
        })]).range([height, 0]);


    var line = d3.line()
        .x(function (d, i) {
            return xScale(d.Year);
        })
        .y(function (d) {
            return yScale(d.Value);
        })
        .curve(d3.curveMonotoneX)

    var svg = d3.select("#chartBoxId").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(dataSet)
        .attr("class", line_color)
        .attr("d", line);



    svg.append("text")
        .attr("x", (width / 2) )
        .attr("y", (margin.top / 2) - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(graphTitle);

    svg.selectAll(".dot")
        .data(dataSet)
        .enter().append("circle")
        .attr("class", dot_color)
        .attr("cx", function (d, i) {
            return xScale(d.Year)
        })
        .attr("cy", function (d) {
            return yScale(d.Value)
        }).attr("r", 5)
        .on("mousemove", function (d) {

            return tooltip.style("top", (event.pageY-50) + "px").
            style("left", (event.pageX) + "px").
            html("<div class='hoverText'>" +d.HoverText+ ':' + d.Value+ "</div>" +
                "<div class='hoverText'>" +"Year :"+ d.Year +"</div>");
        })
        .on("mouseout", function () {
            return tooltip.style("visibility", "hidden");
        })
        .on("mouseover", function () {
            return tooltip.style("visibility", "visible");
        });

    ``

    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(dataSet[hoverIndex].HoverText);



    var tooltip = d3.select("#chartBoxId")
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip")

        .style("visibility", "hidden");
    if (sceneIndex != 2) {
        showAnnotation(sceneIndex, dataSet, xScale, yScale)
    }

}

function showAnnotation(sceneIndex, dataSet, xAxis, yAxis) {
    parent = d3.select("#chartBoxId")
        .select("svg")
        .append("g")

    if (sceneIndex == 0) {
        parent.append("rect")
            .attr("x", xAxis(2009) - 400)
            .attr("y", yAxis(17024.25)+20 )
            .attr("fill", "lightgrey")
            .attr("class", "annotationBox")

        parent.append("text")
            .attr("x", xAxis(2009) - 400+10)
            .attr("y", yAxis(17024.25)+45)
            .attr("class", "annotationText")
            .text("GDP Dip due to Great Recession in 2008-2009");

        d3.select("#chartBoxId")
            .select("svg")
            .append("g")
            .append("line")
            .attr("opacity", 1)
            .attr("style", "stroke:rgb(0,0,0);stroke-width:0.5px")
            .attr("x1", margin.left + xAxis(2009) - 310)
            .attr("y1", 25 + yAxis(17024.25)+45 )
            .attr("x2", margin.left + xAxis(2009))
            .attr("y2", 125 + yAxis(17024.25))
    } else if (sceneIndex == 1) {
        parent.append("rect")
            .attr("x", xAxis(2003)-70)
            .attr("y", yAxis(28.25))
            .attr("fill", "lightgrey")
            .attr("class", "annotationBox")

        parent.append("text")
            .attr("class", "annotation_text")
            .attr("x", xAxis(2003)-30)
            .attr("y", yAxis(28.25)+30)
            .text("Largest Decline in Mortality Rate by 1.8%");

        d3.select("#chartBoxId")
            .select("svg")
            .append("g")
            .append("line")
            .attr("opacity", 1)
            .attr("style", "stroke:rgb(0,0,0);stroke-width:0.5px")
            .attr("x1", margin.left + xAxis(2003))
            .attr("y1", -100 + yAxis(28.9))
            .attr("x2", margin.left + xAxis(2003))
            .attr("y2", 10 + yAxis(28.9))
    }
}


function loadDropDown() {
    var selectTag = d3.select("select");
    d3.select(".scene3box").style("visibility", "visible");
    var options = selectTag.selectAll('option')
        .data(countryNameList);
    options.enter()
        .append('option')
        .attr('value', function (d, i) {
            return i + 2
        })
        .text(function (d) {
            return d

        })
}

function moveToScene(direction) {
    if (direction == 'Next') {
        sceneIndex++;

        if (sceneIndex == 1) {
            d3.select(".scene3box")
                .style("visibility", "hidden")
            hoverIndex = 1;
            showScene(dataGDPMortality[1])

        }
        else if (sceneIndex == 2) {
            loadFinalScene()

        }
    } else {
        sceneIndex--;
        if (sceneIndex == 0) {

            hoverIndex = 0;
            showScene(dataGDPMortality[0])
            d3.select(".scene3box")
                .style("visibility", "hidden")
        }
        else if (sceneIndex == 1) {

            hoverIndex = 1;
            showScene(dataGDPMortality[1])
            d3.select(".scene3box")
                .style("visibility", "hidden")
        }
    }


}

function loadFinalScene() {
    loadDropDown();
    var selected = d3.select("#dropDownId").node().value;
    var index = -1;
    if (document.getElementById("radioButtonId").elements["gdpmortality"].value == '0') {
        hoverIndex = 0

        index = 0;
    } else {
        hoverIndex = 1

        index = 1;

    }
    data1 = dataCountryGDpMortality[index][selected]
    showScene(data1)
}

function getMaxIndex(dataset) {
    var counter = 1;
    var max = 0;
    for (counter; counter < dataset.length; counter++) {
        if (dataset[max].Value < dataset[counter].Value) {
            max = counter;
        }
    }
    return max;
}




