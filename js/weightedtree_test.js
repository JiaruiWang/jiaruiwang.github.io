/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.

 MIT LICENSE:

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
 */

// @version 1.1.20

//**************************************************************************************************************
//
//  This is a test/example file that shows you one way you could use a vizuly object.
//  We have tried to make these examples easy enough to follow, while still using some more advanced
//  techniques.  Vizuly does not rely on any libraries other than D3.  These examples do use jQuery and
//  materialize.css to simplify the examples and provide a decent UI framework.
//
//**************************************************************************************************************


// html element that holds the chart
var viz_container;

// our weighted tree
var viz;

// our theme
var theme;

var nodeclass;

// nested data
var data = {};

// stores the currently selected value field
var valueField = "Federal";
var valueFields = ["Federal", "State", "Local"];


var formatCurrency = function (d) { if (isNaN(d)) d = 0; return "$" + d3.format(",.2f")(d); };

function loadData() {

    d3.csv("data/sales.csv", function (csv) {

        data.values=prepData(csv);

        initialize();

    });

}

function prepData(csv) {

    var values=[];


    //Clean federal budget data and remove all rows where all values are zero or no labels
    csv.forEach(function (d) {
            values.push(d);
    })

    //Make our data into a nested tree.  If you already have a nested structure you don't need to do this.
    var nest = d3.nest()
        .key(function (d) {
            return d.Agency;
        })
        .key(function (d) {
            return d.Category;
        })
        .key(function (d) {
            return d.Detail;
        })
        .key(function (d) {
            return d.Vendor;
        })
        // .key(function (d) {
        //     return d.Federal;
        // })
        // .rollup(function(leaves) { return {"count": leaves.length, "total_payments": d3.sum(leaves, function(d) {return parseFloat(d.Payments);})} })
        .entries(values);

    


    //This will be a viz.data function;
    vizuly.data.aggregateNest(nest, valueFields, function (a, b) {
        return Number(a)+Number(b);
    });

    //Remove empty child nodes left at end of aggregation and add unqiue ids
    function removeEmptyNodes(node,parentId,childId) {
        if (!node) return;
        node.id=parentId + "_" + childId;
        if (node.values) {
            for(var i = node.values.length - 1; i >= 0; i--) {
                node.id=parentId + "_" + i;
                if(!node.values[i].key && !node.values[i].Level4) {
                    node.values.splice(i, 1);
                }
                else {
                    removeEmptyNodes(node.values[i],node.id,i)
                }
            }
        }
    }

    var node={};
    node.values = nest;
    removeEmptyNodes(node,"0","0");
    //console.log(nest);
    return nest;
}

function initialize() {


    viz = vizuly.viz.weighted_tree(document.getElementById("viz_container"));

    var treesvg = d3.select("#viz_container").select("svg");
    treesvg.call(tip);
    //Here we create three vizuly themes for each radial progress component.
    //A theme manages the look and feel of the component output.  You can only have
    //one component active per theme, so we bind each theme to the corresponding component.
    theme = vizuly.theme.weighted_tree(viz).skin(vizuly.skin.WEIGHTED_TREE_AXIIS);

    //Like D3 and jQuery, vizuly uses a function chaining syntax to set component properties
    //Here we set some bases line properties for all three components.
    viz.data(data)                                                      // Expects hierarchical array of objects.
        .width(600)                                                     // Width of component
        .height(600)                                                    // Height of component
        .children(function (d) { return d.values })                     // Denotes the property that holds child object array
        .key(function (d) { return d.id })                              // Unique key
        .value(function (d) {
            return Number(d["agg_" + valueField]) })                    // The property of the datum that will be used for the branch and node size
        .fixedSpan(-1)                                                  // fixedSpan > 0 will use this pixel value for horizontal spread versus auto size based on viz width
        .label(function (d) {                                           // returns label for each node.
            return trimLabel(d.key || (d['Level' + d.depth]))})
        .on("measure",onMeasure)                                        // Make any measurement changes
        .on("mouseover",onMouseOver)                                    // mouseover callback - all viz components issue these events
        .on("mouseout",onMouseOut)                                      // mouseout callback - all viz components issue these events
        .on("click",onClick);                                           // mouseout callback - all viz components issue these events


    //We use this function to size the components based on the selected value from the RadiaLProgressTest.html page.
    changeSize(d3.select("#currentDisplay").attr("item_value"));

    // Open up some of the tree branches.
    viz.toggleNode(data.values[17]);
    viz.toggleNode(data.values[17].values[10]);
    viz.toggleNode(data.values[17].values[10].values[0]);
    viz.toggleNode(data.values[17].values[10].values[4]);
    viz.toggleNode(data.values[17].values[10].values[8]);
    viz.toggleNode(data.values[6]);
    viz.toggleNode(data.values[6].values[10]);
    viz.toggleNode(data.values[6].values[13]);
    viz.toggleNode(data.values[6].values[13].values[0]);

    // console.log(data);
    // console.log(data.values);

}


function trimLabel(label) {
   return (String(label).length > 20) ? String(label).substr(0, 17) + "..." : label;
}


var datatip='<div class="tooltip" style="width: 250px; background-opacity:.5">' +
    '<div class="header1">HEADER1</div>' +
    '<div class="header-rule"></div>' +
    '<div class="header2"> HEADER2 </div>' +
    '<div class="header-rule"></div>' +
    '<div class="header3"> HEADER3 </div>' +
    '</div>';


// This function uses the above html template to replace values and then creates a new <div> that it appends to the
// document.body.  This is just one way you could implement a data tip.
function createDataTip(x,y,h1,h2,h3) {

    var html = datatip.replace("HEADER1", h1);
    html = html.replace("HEADER2", h2);
    html = html.replace("HEADER3", h3);

    d3.select("body")
        .append("div")
        .attr("class", "vz-weighted_tree-tip")
        .style("position", "absolute")
        .style("top", y + "px")
        .style("left", (x - 125) + "px")
        .style("opacity",0)
        .html(html)
        .transition().style("opacity",1);

}

function onMeasure() {
   // Allows you to manually override vertical spacing
   viz.tree().nodeSize([30,0]);
}

function onMouseOver(e,d,i) {
    // console.log((d3.select(e).select('circle'))[0][0])
    // console.log(onMouseOver.caller == waitover)
    // console.log(onMouseOver.caller == t)
    // console.log(e)
    // console.log(d)
    // console.log(d.target)
    // console.log(i)
    if (d == data) return;
    // var rect = e.getBoundingClientRect();
    if (d.target){ d = d.target; e=document.getElementsByClassName('vz-weighted_tree-node vz-id-'+d.id)[0]}//This if for link elements
    //createDataTip(rect.left, rect.top, (d.key || (d['Level' + d.depth])), formatCurrency(d["agg_" + valueField]),valueField);
//          console.log(d)
// console.log(e)

        tip.show(d,(d3.select(e).select('circle'))[0][0])
    // if (onMouseOver.caller == waitover) {console.log("from waitover");tip.show(d,e);} else {console.log("not from waitover");tip.show(d,d3.select(e).select('circle'));}
}

function onMouseOut(e,d,i) {
    // d3.selectAll(".vz-weighted_tree-tip").remove();
    tip.hide(d);
}

function toggleAll(d) {
    // console.log(d.children)
    if (d.children) {
        // console.log("within toggleAll")
      d.children.forEach(toggleAll);
      viz.toggleNode(d);
    }
}

//We can capture click events and respond to them
function onClick(g,d,i) {

    viz.toggleNode(d);

    if (d.depth == 4) {

        document.getElementById('selectVendors').value=d.key;

        dropVendersOn();

    }
    

}



//This function is called when the user selects a different skin.
function changeSkin(val) {
    if (val == "None") {
        theme.release();
    }
    else {
        theme.viz(viz);
        theme.skin(val);
    }

    viz().update();  //We could use theme.apply() here, but we want to trigger the tween.
}

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
    var s = String(val).split(",");
    viz_container.transition().duration(300).style('width', s[0] + 'px').style('height', s[1] + 'px');
    viz.width(s[0]).height(s[1]*.8).update();
}

//This sets the same value for each radial progress
function changeData(val) {
    valueField=valueFields[Number(val)];
    viz.update();
}

var tip = d3.tip()
.attr("class", "d3-tip")
.offset([-10, 0])
.html(function(d) {
    var obj = d;
    var label=[];
    label[0] = "root";
    for (var i = obj.depth; i > 0; i--) {
        label[i] = obj.key;
        obj = obj.parent;
    }
    
    var a ="";
    var k = 1;
    if (k<label.length) {a+="<span style='color:GoldenRod'>Agency</span> : " + label[k]+ "<br>";k++;};
    if (k<label.length) {a+="<span style='color:GoldenRod'>Category</span> : " + label[k]+"<br>";k++};
    if (k<label.length) {a+="<span style='color:GoldenRod'>Detail</span> : "+label[k]+"<br>";k++};
    if (k<label.length) {a+="<span style='color:GoldenRod'>Vendor</span> : "+label[k]+"<br>";k++};
    a += "<span style='color:GoldenRod'>Expenditures</span> : "+(formatCurrency(d.agg_Federal));
    // console.log(d.agg_Federal);

    return a;
});





