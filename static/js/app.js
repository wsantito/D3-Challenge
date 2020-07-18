
// Set up of margins
let svgWidth = 1000;
let svgHeight = 600;

let margin = {
  top: 10,
  right: 10,
  bottom: 100,
  left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

//Start SVG Wrapper
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Start appending by group
let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// SetAxis
let SetXAxis = "poverty";
let SetYAxis = "healthcare";

// Functions to update scales on the Axis
function ScaleX (data, SetXAxis) {
    let LScaleX = d3.scaleLinear()
      .domain([d3.min(data, d => d[SetXAxis]) * 0.8,
        d3.max(data, d => d[SetXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return LScaleX;
  
  }

function ScaleY(data, SetYAxis) {
    let LScaleY = d3.scaleLinear()
      .domain([d3.min(data, d => d[SetYAxis]) * 0.8,
        d3.max(data, d => d[SetYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return LScaleY;
  
  }
  
// Functions to update the Information

//**AXIS Data Uptate */
function RenderX(NScaleX, AxisX) {
    let AxisBottom = d3.axisBottom(NScaleX);
  
    AxisX.transition()
      .duration(500)// Increase it make it slower
      .call(AxisBottom);
  
    return AxisX;
  }

function RenderY(NScaleY, AxisY) {
    let AxisLeft = d3.axisLeft(NScaleY);

    AxisY.transition()
        .duration(500)// Increase it make it slower
        .call(AxisLeft);

    return AxisY;
}

//**Group Data Update */
function DataRender(Databubbles, NScaleX, SetXAxis, NScaleY, SetYAxis) {

    Databubbles.transition()
      .duration(500)
      .attr("cx", d => NScaleX(d[SetXAxis]))
      .attr("cy", d => NScaleY(d[SetYAxis]));
      

    return Databubbles;
  }

//** Text Data Update */
function TextUpdate(BubbleText, NScaleX, SetXAxis, NScaleY, SetYAxis) {

    BubbleText.transition()
        .duration(500)
        .attr("x", d => NScaleX(d[SetXAxis]))
        .attr("y", d => NScaleY(d[SetYAxis]));

    return BubbleText;
}

//** Labels Data Update */
function ToolTipUpdate(SetXAxis, SetYAxis, Databubbles) {
    let label  = "";
    if (SetXAxis === "poverty") {
        label = "Poverty: ";
    }

    else if (SetXAxis === "income") { 
         label = "Household Income:";   

    }

    else {
        label = "Age:";
    }

     let yLabel = "";
    if (SetYAxis === "healthcare") {
         yLabel = "No Healthcare: "
    }

    else if (SetYAxis === "obesity") {
         yLabel = "Obesity: "
    }
    
    else {
         yLabel = "Smokes: "
    }

    let ToolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([100,-50])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[SetXAxis]}<br>${yLabel} ${d[SetYAxis]}`);
        });

    Databubbles.call(ToolTip);

    //**Display Data */
    Databubbles.on("mouseover", function(data) {
        ToolTip.show(data, this);
    })
    //**Remove Data */
    .on("mouseout", function(data, index) {
        ToolTip.hide(data, this);
    });

  return Databubbles;
}

//**Call CSV */

// Async por que es una promesa
//https://developers.google.com/web/fundamentals/primers/async-functions?hl=es
(async function(){
    let PlotData = await d3.csv("data.csv");

    // Retrieve the specif data required
    PlotData.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    // Scale function for PLot Data
    let LScaleX = ScaleX(PlotData, SetXAxis);
    let LScaleY = ScaleY(PlotData, SetYAxis);

    // Create Axis for the 
    let AxisBottom = d3.axisBottom(LScaleX);
    let AxisLeft = d3.axisLeft(LScaleY);

    // Agregate or append per Axis the Axis
    let AxisX = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(AxisBottom);

    let AxisY = chartGroup.append("g")
        .classed("y-axis", true)
        .call(AxisLeft);

    // Agregate or append the DataBubbles
    let Databubbles = chartGroup.selectAll("Bubbles")
        .data(PlotData)
        .enter()
        .append("circle")
        .attr("cx", d => LScaleX(d[SetXAxis]))
        .attr("cy", d => LScaleY(d[SetYAxis]))
        .attr("r", 12)
        .attr("fill", "Aquamarine")
        .attr("opacity", "1");

    // append state abbreviations
    let BubbleText = chartGroup.selectAll(".StateIDT")
        .data(PlotData)
        .enter()
        .append("text")
        .classed("StateID", true)
        .attr("x", d => LScaleX(d[SetXAxis]))
        .attr("y", d => LScaleY(d[SetYAxis]))
        .attr("dx", -1)
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function(d) {return d.abbr});

    let GroupLabels = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    //Create Labels with the listeners for the X values
    let PovertyLabel = GroupLabels.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // **listener
        .classed("active", true)
        .text("In Poverty (%)");

    let AgeLabel = GroupLabels.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // **listener
        .classed("inactive", true)
        .text("Age (Median)");

    let IncomeLabel = GroupLabels.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // **listener listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    let GroupLabelsY = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);
        
    //Create Labels with the listeners for the Y values
    let HealthLabel = GroupLabelsY.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare") // **listener listener
        .text("Lacks Healthcare (%)");

    let SmokesLabel = GroupLabelsY.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")// **listener listener
        .text("Smokes (%)");

    let ObesityLabel = GroupLabelsY.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")// **listener listener
        .text("Obese (%)");

    // ToolTipUpdate function above csv import
    Databubbles = ToolTipUpdate(SetXAxis, SetYAxis, Databubbles);

    // X axis labels event listener
    GroupLabels.selectAll("text")
        .on("click", function() {
        let value = d3.select(this).attr("value");
        if (value !== SetXAxis) {

            SetXAxis = value;// SetXAxis new value
            LScaleX = ScaleX(PlotData, SetXAxis);// Updates Scale of the new selection
            AxisX = RenderX(LScaleX, AxisX);// Re-Render Axis 
            Databubbles = DataRender(Databubbles, LScaleX, SetXAxis, LScaleY, SetYAxis); // Updates Bubbles Values
            BubbleText = TextUpdate(BubbleText, LScaleX, SetXAxis, LScaleY, SetYAxis);  // Update StateIDs
            Databubbles = ToolTipUpdate(SetXAxis, SetYAxis, Databubbles);// Updates ToolTips

            // changes classes to change bold text
            if (SetXAxis === "poverty") {
                PovertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);   
            }
            else if (SetXAxis ==="age") {
                PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                AgeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);  
            }
            else {
                PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                 AgeLabel
                     .classed("active", false)
                     .classed("inactive", true);
                IncomeLabel
                    .classed("active", true)
                    .classed("inactive", false); 

            }
        }
    });

    // Y axis labels event listener
        GroupLabelsY.selectAll("text")
        .on("click", function() {
            let value = d3.select(this).attr("value");
    
            //check if value is same as current axis
            if (value != SetYAxis) {
    
                SetYAxis = value;// SetYAxis new value
                LScaleY = ScaleY(PlotData, SetYAxis);// Updates Scale of the new selection
                AxisY = RenderY(LScaleY, AxisY);// Re-Render Axis 
                Databubbles = DataRender(Databubbles, LScaleX, SetXAxis, LScaleY, SetYAxis); // Updates Bubbles Values
                BubbleText = TextUpdate(BubbleText, LScaleX, SetXAxis, LScaleY, SetYAxis)// Update StateIDs
                Databubbles = ToolTipUpdate(SetXAxis, SetYAxis, Databubbles);// Updates ToolTips
    
                //change classes to change bold text
                if (SetYAxis === "obesity") {
                    ObesityLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    SmokesLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    HealthLabel
                      .classed("active", false)
                      .classed("inactive", true);
                }
                else if (SetYAxis === "smokes") {
                    ObesityLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    SmokesLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    HealthLabel
                      .classed("active", false)
                      .classed("inactive", true);
                }
                else {
                    ObesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    SmokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    HealthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
})()

