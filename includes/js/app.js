/* jshint laxcomma:true, asi:true */
/* globals d3, dc, crossfilter */
'use strict'

var compositeChart   = dc.compositeChart('#container-compositechart')
  , uiZoomChart = dc.lineChart('#container-ui-zoom-chart')
  , barChart    = dc.barChart('#container-barchart')
  , allCharts   = [ compositeChart, uiZoomChart, barChart ]
  , datafile = 'includes/data/cdp8.csv'


d3.csv( datafile, function(error, rawdata) {

  var dateFormat    // function to format date as year
    , numberFormat  // function to format number with 2 decimals
    , nearest       // helper function to round numbers
    , displayAvg    // helper function to display tooltip
    , initCapacityData // set up crossfilter capacity data
    , alldata       // all crossfiltered data
    , yearDim       // year data dimension
    , capacityDim   // capactiy data dimension
    , capacityGroup // capacity dimension group
    , cpkwniGroup   // cost per kW without incentives group
    , cpkwiGroup    // cost per kW with incentives group
    , startYear     // first year in domain
    , stopYear      // last year in domain
    , binSize       // capacity barchart bin size


  dateFormat   = d3.time.format('%Y')
  numberFormat = d3.format('.2f')


  $('a.reset').on( 'click', function(){
    allCharts.forEach( function(chart) {
        chart.filterAll()
    })

    dc.redrawAll()
  })

  $('#binSize').on( 'change', function( event ){
    binSize = parseInt( event.target.value )
    initCapacityData(alldata, binSize)

    barChart
        .group(capacityGroup)
        .xUnits( function(){ return binSize / 10 }) // todo:find a multiplier to scale this
        .render()
  })

  /**
   * Round n to the nearest v.
   * e.g. nearest(51,100) => 100; nearest(1001,1000) => 1000
   * @param  {int} n the number to be rounded
   * @param  {int} v the base to round to
   * @return {int}   the resulting rounded number
   */
  nearest = function nearest(n, v) {
      n = n / v
      n = Math.round(n) * v
      return n
  }


  /**
   * Helper function to display tooltips on graph
   * @param  {Array} d  Array with [key,value], where value is an object
   * @return {String}   Year / Cost
   */
  displayAvg = function (d) {
    var value = d.value.avg ? d.value.avg : d.value

    if ( isNaN(value) ) { value = 0 }

    return dateFormat(d.value.year) + '\n'+'$' + numberFormat(value) + '/kW'
  }

  /**
   * Create the dimension and group for capacity data. (Triggered by UI select)
   * @param  {Object} data  Crossfilter data
   * @param  {int} bin  Integer to bin our dimension to
   * @return none
   */
  initCapacityData = function(data, bin){
    capacityDim = data.dimension( function(d) { return nearest(d.capacity, bin) })
    capacityGroup = capacityDim.group()
  }


  // coerce to date/int, and rename object properties
  rawdata.forEach(function(x) {
    x.year     = dateFormat.parse(x.year)
    x.capacity = parseInt(x['capacity(kW)'], 10)
    x.cpkwni   = parseInt(x['$/kW NI'], 10)
    x.cpkwi    = parseInt(x['$/kW I'], 10)
  })


  binSize = parseInt( document.querySelector('#binSize').value )


  // set up crossfilter dimensions
  alldata     = crossfilter(rawdata)
  yearDim     = alldata.dimension( function(d) { return +d.year })

  initCapacityData( alldata, binSize )

  startYear = yearDim.bottom(1)[0].year
  stopYear  = yearDim.top(1)[0].year


  // Find the average for each year
  cpkwniGroup = yearDim.group().reduce(
    function(p,v) {
        p.count++
        p.year = v.year
        p.sum += v.cpkwni
        p.avg = d3.round(p.sum / p.count, 2)
        return p
    },
    function(p,v) {
        p.count--
        p.year = v.year
        p.sum -= v.cpkwni
        p.avg = d3.round((p.sum / p.count), 2)
        return p
    },
    function() {return { count: 0, year: 0, avg: 0, sum: 0} }
  )

  // Find the average for each year
  cpkwiGroup = yearDim.group().reduce(
    function(p,v) {
        p.count++
        p.year = v.year
        p.sum += v.cpkwi
        p.avg = d3.round(p.sum / p.count, 2)
        return p
    },
    function(p,v) {
        p.count--
        p.year = v.year
        p.sum -= v.cpkwi
        p.avg = d3.round((p.sum / p.count), 2)
        return p
    },
    function() {return { count: 0, year: 0, avg: 0, sum: 0} }
  )


  // set up line/area chart
  compositeChart
        .width(750)
        .height(480)
        .margins({top: 25, right: 25, bottom: 25, left: 75})
        .transitionDuration(1000)
        .dimension(yearDim)
        .x(d3.time.scale().domain([startYear, stopYear]))
        .yAxisLabel('Cost per Kilowatt ($/kW)')
        .legend(dc.legend().x(100).y(20).itemHeight(13).gap(5))
        .renderHorizontalGridLines(true)
        .rangeChart(uiZoomChart)
        .brushOn(false)
        .shareTitle(false)
        .compose([
            dc.lineChart(compositeChart)
                .colors('#0079C2')
                .group(cpkwiGroup, 'Incentive')
                .valueAccessor( function (d) { return d.value.avg })
                .title(displayAvg)
            ,
            dc.lineChart(compositeChart)
                .colors('#F7A11A')
                .group(cpkwniGroup, 'No incentive')
                .valueAccessor( function (d) { return d.value.avg })
                .title(displayAvg)
        ])


  // set up range chart
  uiZoomChart
    .width(750)
    .height(100)
    .renderArea(true)
    .colors('#777777')
    .margins({top: 25, right: 25, bottom: 25, left: 75})
    .dimension(yearDim)
    .group(cpkwniGroup)
    .valueAccessor( function (d) { return d.value.avg })
    .x(d3.time.scale().domain([startYear, stopYear]))


  // set up barChart
  barChart
    .width(750)
    .height(400)
    .margins({top: 25, right: 25, bottom: 50, left: 75})
    .dimension(capacityDim)
    .group(capacityGroup)
    .centerBar(true)
    .barPadding(0.1) // 10% of bar width
    .renderHorizontalGridLines(true)
    .x(d3.scale.linear())
    .elasticX(true)
    .xUnits( function(){ return binSize / 10 } ) // arbitrary value. fixes skinny bar issue.
    .xAxisPadding(binSize) // fixes clipping on the first and last bars
    .xAxisLabel('Capacity (kW)')
    .renderTitle(true)
    .title(function (d) { return d.value + ' in bin ' + d.key })
    .brushOn(false)

  dc.renderAll()

})
