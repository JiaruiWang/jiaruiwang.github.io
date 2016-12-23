
var lock=0;
function dashboard(id, fData){
    var barColor = 'steelblue';
    var hGsvg;
    function segColor(c){ return {'BUILDING LEASE PAYMENTS':"#c7c7c7", 'COMMUNICATION SERVICE & SUPPLIES':"#aec7e8",'COMPUTER EQUIPMENT':"#ff7f0e", 'DEBT SERVICE':"#ffbb78", 'EQUIPMENT RENTAL & LEASES':"#2ca02c", 'FUEL & UTILITIES':"#98df8a", 'HOUSEKEEP & JANITOR SERVICES':"#d62728", 'MISCELLANEOUS EXPENSES':"#ff9896", 'MOTORIZED EQUIPMENT':"#9467bd", 'OFFICE EQUIPMENT':"#c5b0d5", 'OTHER EQUIPMENT':"#8c564b", 'PROFESSIONAL DEVELOPMENT':"#c49c94", 'PROFESSIONAL SERVICES':"#e377c2", 'PROGRAM DISTRIBUTIONS':"#f7b6d2", 'PROPERTY & IMPROVEMENTS':"#bcbd22",'REPAIR & MAINTENANCE SERVICES':"#dbdb8d", 'SUPPLIES':"#17becf",'TRAVEL':"#9edae5"}[c]; }
    
    // compute total for each state.
    fData.forEach(function(d){d.total=d.freq['BUILDING LEASE PAYMENTS']+d.freq['COMMUNICATION SERVICE & SUPPLIES']+d.freq['COMPUTER EQUIPMENT']+d.freq['DEBT SERVICE']+d.freq['EQUIPMENT RENTAL & LEASES']+d.freq['FUEL & UTILITIES']+d.freq['HOUSEKEEP & JANITOR SERVICES']+d.freq['MISCELLANEOUS EXPENSES']+d.freq['MOTORIZED EQUIPMENT']+d.freq['OFFICE EQUIPMENT']+d.freq['OTHER EQUIPMENT']+d.freq['PROFESSIONAL DEVELOPMENT']+d.freq['PROFESSIONAL SERVICES']+d.freq['PROGRAM DISTRIBUTIONS']+d.freq['PROPERTY & IMPROVEMENTS']+d.freq['REPAIR & MAINTENANCE SERVICES']+d.freq['SUPPLIES']+d.freq['TRAVEL'];});
    
    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 0, r: 0, b: 0, l: 0};
        hGDim.w = 950 - hGDim.l - hGDim.r, 
        hGDim.h = 420 - hGDim.t - hGDim.b;
            
        //create svg for histogram.
        hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l+ 300 + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        var y = d3.scale.ordinal()
                    .rangeRoundBands([0, hGDim.h], 0.1)
                    .domain(fD.map(function(d) { return d[0]; }));

        // Add y-axis to the histogram svg.
        hGsvg.append("g").attr("class", "y axis")
            .call(d3.svg.axis().scale(y).orient("left"))
            .selectAll("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .on("click", onclick)
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);

        // Create function for x-axis map.
        var x = d3.scale.linear().range([0, hGDim.w - 410])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar")
                        .data(fD)
                        .enter()
                        .append("g").attr("class", "bar");
  
        //create the rectangles.
        bars.append("rect")
            .attr("y", function(d) { return y(d[0]); })
            .attr("x", function(d) { return 0;
            //    return x(d[1]); 
            })
            .attr("height", y.rangeBand())
            .attr("width", function(d) { return x(d[1]); })
            .attr('fill',barColor)
            .on("click", onclick)
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);// mouseout is defined below.
                  
        //Create the payments labels above the rectangles.
        bars.append("text")
            .text(function(d){ return '$'+d3.format(",")(d[1])})
            .attr("y", function(d) { return y(d[0])+y.rangeBand()/2; })
            .attr("x", function(d) { return x(d[1]); })
            .attr("alignment-baseline","central")
            .attr("text-anchor", "start");
        function onclick(d,i){
            // if(xAxis !='Agency')
            // {
            //     xAxis='Agency';
            //     updateChart(xAxis);
            // }   

            data.children.forEach(toggleAll);

            // console.log(fData[i].State)
            for (var j = 0; j < data.values.length; j++) {
                if(data.values[j].key == fData[i].State)
                {
                    viz.toggleNode(data.values[j]);
                }
            }
            
            if(lock == 0) lock=1; else lock = 0;
            // console.log(lock);

        }
        function mouseover(d,i){  // utility function to be called on mouseover.
            // filter for selected state.
            // console.log(i);
            // console.log(d);
            // d[0]=(fData[i].State);
            d3.select(this).style("cursor", "pointer");
            var st = fData.filter(function(s){return s.State == fData[i].State;})[0];
            // console.log(st);
            var nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
              
               // console.log(nD);
            // call update functions of pie-chart and legend.  
            // console.log(d)  
            if(lock == 0){


                hGsvg.selectAll("rect")
                .filter(function(rect_d){
                    // console.log(rect_d)
                    // console.log(typeof d)
                    // console.log(d)
                    if((typeof d)!= 'string')
                        return rect_d[1] == d[1];
                    else
                        return rect_d[0] == d;
                })
                .style("opacity", "0.5");

                pC.update(nD);
                leg.update(nD);
            }//console.log(lock);
        }
        
        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            if(lock == 0){
                hGsvg.selectAll("rect")
                .style("opacity", "1");


                tr.selectAll("rect")
                .style("opacity", "1");

                piesvg.selectAll("path")
                .style("opacity", "1");


                pC.update(tF);
                leg.update(tF);

                hG.update(fData.map(function(v){
                    return [v.State,v.total];}), barColor);
            }//console.log(lock);
            d3.select(this).style("cursor", "default")
        }
        
        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            x.domain([0, d3.max(nD, function(d) { return d[1]; })]);
            
            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);
            
            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("x", function(d) {return 0; })
                .attr("width", function(d) { return x(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return '$' + d3.format(",")(d[1])})
                .attr("x", function(d) {return x(d[1]); });            
        }       
        return hG;
    }
    var piesvg;
    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:440, h: 440};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
                
        // create svg for pie chart.
        piesvg = d3.select('#pieChart').append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+(pieDim.w/2+10)+","+(pieDim.h/2 ) +")");
        
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .attr("class",function(d) {return d.data.type})
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("click", onclick)
            .on("mouseover",mouseover).on("mouseout",mouseout);

       

        
        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }     


        function onclick(d,i){
            // if(xAxis !='Category')
            // {
            //     xAxis='Category';
            //     updateChart(xAxis);
            // }  
            if(lock == 0) lock=1; else lock = 0;             
            // console.log(lock);

        }   
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // console.log("mmmmmm",d);
            d3.select(this).style("cursor", "pointer")
             piesvg.append("title")
                .text(d.data.type + ", $" + d3.format(",")(d.data.freq));

            // console.log(d) 

                

            // call the update function of histogram with new data.
            // var cla = document.getElementsByClassName(d.data.type);
            // cla[1].style.opacity = '0.5';
            // cla[0].style.opacity = '0.5';
            if(lock == 0){
                tr.selectAll("rect")
                .filter(function(len_d){
                    return len_d.freq == d.data.freq;
                })
                .style("opacity", "0.5");

                piesvg.selectAll("path")
                .filter(function(pie_d){
                    return pie_d.data.freq == d.data.freq;
                })
                .style("opacity", "0.5");

                hG.update(fData.map(function(v){ 
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
            }//console.log(lock);
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            // var cla = document.getElementsByClassName(d.data.type);
            // cla[1].style.opacity = '1';
            // cla[0].style.opacity = '1';
            piesvg.select("title").remove();
            d3.select(this).style("cursor", "default")

            
            if(lock == 0){
                tr.selectAll("rect")
                .style("opacity", "1");

                piesvg.selectAll("path")
                .style("opacity", "1");

                hGsvg.selectAll("rect")
                .style("opacity", "1");

                pC.update(tF);
                leg.update(tF);

                hG.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
            }//console.log(lock);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    
        return pC;
    }
    var tr;
    // function to handle legend.
    function legend(lD){
        var leg = {};
            
        // create table for legend.
        var legend = d3.select('#ta').append("table").attr('class','legend');
        
        // create one row per segment.
        tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
            
        // create the first column for each segment.
        tr.append("td").append("svg").attr("transform","translate(80,80)")
            .attr("width", '14').attr("height", '14')
            .append("rect")
            .attr("width", '14').attr("height", '14')

            .attr("class",function(d) {return d.type})
            .attr("fill",function(d){ return segColor(d.type); })
            .on("click", onclick)
            .on("mouseover",mouseover).on("mouseout",mouseout);


        function onclick(d,i){
            // if(xAxis !='Category')
            // {
            //     xAxis='Category';
            //     updateChart(xAxis);
            // }  
            if(lock == 0) lock=1; else lock = 0; 
            // console.log(lock);
        } 

        function mouseover(d){
        // call the update function of histogram with new data.
        //    var cla = document.getElementsByClassName(d.type);
        //    cla[0].style.opacity = '0.5'; 
        //    cla[1].style.opacity = '0.5';
            d3.select(this).style("cursor", "pointer")
            // console.log(d) 

            if(lock == 0){
                piesvg.selectAll("path")
                .filter(function(pie_d){
                    return pie_d.data.freq == d.freq;
                })
                .style("opacity", "0.5");

                tr.selectAll("rect")
                .filter(function(len_d){
                    return len_d.freq == d.freq;
                })
                .style("opacity", "0.5");
                hG.update(fData.map(function(v){
                    return [v.State,v.freq[d.type]];}),segColor(d.type));
            }//console.log(lock);
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            // var cla = document.getElementsByClassName(d.type);
            // cla[0].style.opacity = '1';
            // cla[1].style.opacity = '1';
            d3.select(this).style("cursor", "default")
            
            if(lock == 0){
                piesvg.selectAll("path")
                .style("opacity", "1");

                tr.selectAll("rect")
                .style("opacity", "1");

                hGsvg.selectAll("rect")
                .style("opacity", "1");

                pC.update(tF);
                leg.update(tF);

                hG.update(fData.map(function(v){
                    return [v.State,v.total];}), barColor);
            }//console.log(lock);
        }
            
        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;}).on("click", onclick)
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq').attr("align",'right')
            .text(function(d){ return '$'+d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc').attr("align",'right')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return '$'+d3.format(",")(d.freq);}).on("click", onclick)
            .on("mouseover",mouseover).on("mouseout",mouseout);

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);}).on("click", onclick)
            .on("mouseover",mouseover).on("mouseout",mouseout);        
        }
        
        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
    }
    
    // calculate total frequency by segment for all state.
    var tF = ['BUILDING LEASE PAYMENTS','COMMUNICATION SERVICE & SUPPLIES','COMPUTER EQUIPMENT','DEBT SERVICE', 'EQUIPMENT RENTAL & LEASES', 'FUEL & UTILITIES', 'HOUSEKEEP & JANITOR SERVICES', 'MISCELLANEOUS EXPENSES', 'MOTORIZED EQUIPMENT', 'OFFICE EQUIPMENT', 'OTHER EQUIPMENT', 'PROFESSIONAL DEVELOPMENT', 'PROFESSIONAL SERVICES', 'PROGRAM DISTRIBUTIONS', 'PROPERTY & IMPROVEMENTS','REPAIR & MAINTENANCE SERVICES', 'SUPPLIES','TRAVEL'].map(function(d){ 
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    }); 
    // console.log(fData);   
    // console.log(tF);
    // calculate total frequency by state for all segment.
    
    var sF = fData.map(function(d){return [d.State,d.total];});
    // console.log(sF);
    var hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF);  // create the legend.
    d3.select('#pb_ti').append("text")
        .attr("x", 875)             
        .attr("y", 25)
        .attr("text-anchor", "middle")  
        .style("font-size", "30px")  
        .style("font-family", "sans-serif")
        .style("font-weight","normal")
        .style('fill','black') 
        .text("Total Expenditures of/within Agencies(bar) and Categories(pie)");
}

dashboard('#dashboard',freqData);