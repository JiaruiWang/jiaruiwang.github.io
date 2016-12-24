//Once the document is ready we set javascript and page settings
var screenWidth;
var screenHeight;

$(document).ready(function () {

    var rect;
    if (self==top) {
        rect = document.body.getBoundingClientRect();
    }
    else {
        rect = document.body.getBoundingClientRect();
    }

    //Set display size based on window size.
    screenWidth = (rect.width < 960) ? Math.round(rect.width*.95) : Math.round((rect.width - 210) *.95);

    screenHeight = 1000;

    d3.select("#currentDisplay")
            .attr("item_value", 800 + "," + 900)
            .attr("class", "selected");


    // Set the size of our container element.
    viz_container = d3.selectAll("#viz_container")
            .style("width", 800 + "px")
            .style("height", 900 + "px");

    var descript = d3.select('#tree_ti').append("text")
        .attr("x", 0)             
        .attr("y", 0)
        .attr("text-anchor", "start")     
          .style("font-family", "sans-serif")
          .style("font-weight","normal")
        .style("font-size", "20px")  
        .style('fill','black') 
        .append("tspan")
        .attr('fill','black')
        .attr('x',20)
        .attr('y','1em')
        .text("Data hierarchy for Agency, Category, Detail and Vendor. Click on leaf, will filter the")
        .style("font-size", "20px")  
        .style("font-family", "sans-serif")
        .style("font-weight","normal");

    descript.append("tspan")
        .attr('fill','black')
        .attr('x',20)
        .attr('y','2.2em')
        .text("scatter plots by vendor on the right.")
        .style("font-size", "20px")  
        .style("font-family", "sans-serif")
        .style("font-weight","normal")

    loadData();

});