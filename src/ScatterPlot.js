import React, { useEffect, useRef }  from 'react';
import * as d3 from 'd3';
import Data from './Data';
import Graph from './Graph';
import './Graph.css';

/**
 * Scatter plot in an SVG element.
 *
 * This component is stateless because the zoom can be calculated from the event coordinates and the initial domains.
 *
 * @param  {Object}  props  properties
 * @return component
 */
const ScatterPlot = ( props ) => {

    // Initialization.
    const width = 400,
        height = 400,
        padding = { top: 20, right: 20, bottom: 20, left: 20 },
        margin = { top: 10, right: 10, bottom: 50, left: 50 };
    let ref = useRef(),
        { dataSet } = props,
        xLabel = Data.getColumnNames( dataSet )[ 1 ],
        yLabel = Data.getColumnNames( dataSet )[ 2 ],
        data = Data.getValues( dataSet ),
        xDomain0 = [ d3.min( data, d => d[ 1 ]), d3.max( data, d => d[ 1 ])],
        yDomain0 = [ d3.min( data, d => d[ 2 ]), d3.max( data, d => d[ 2 ])],
        xScale = d3.scaleLinear().domain( xDomain0 ).range([ margin.left + padding.left, width - margin.right - padding.right ]),
        yScale = d3.scaleLinear().domain( yDomain0 ).range([ height - margin.bottom - padding.bottom, margin.top + padding.top ]),
        symbolScale = d3.scaleOrdinal( data.map( datum => datum[ 0 ]), d3.symbols.map( s => d3.symbol().type( s ).size( 100 )()));
    
    // Zoom in two dimensions.
    let onZoom2D = ( isIn ) => {
        Graph.onZoom2D( isIn, xScale, yScale, xDomain0, yDomain0, true, true );
        ScatterPlot.draw( ref, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, dataSet, symbolScale );
    };
    
    // Zoom in one dimension.
    let onMouseDown = ( event ) => {
        Graph.onMouseDown( event, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0 );
    },
    onMouseUp = ( event ) => {
        if( Graph.downLocation.isX || Graph.downLocation.isY ) {
            Graph.onMouseUp( ref, event, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0 );
            ScatterPlot.draw( ref, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, dataSet, symbolScale );
        }
    };
    
    // Set hook to draw on mounting.
    useEffect(() => {
        ScatterPlot.draw( ref, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, dataSet, symbolScale );
    });
    
    // Return the component.
    return <Graph width={width} height={height} margin={margin} padding={padding}
        onZoom={onZoom2D} onMouseDown={onMouseDown} onMouseUp={onMouseUp} ref={ref} />
};

/**
 * Draws the scatter plot.
 *
 * @param  {Object}   ref          reference to DIV
 * @param  {number}   width        width, in pixels
 * @param  {number}   height       height, in pixels
 * @param  {Box}      margin       margin
 * @param  {Box}      padding      padding
 * @param  {D3Scale}  xScale       X scale
 * @param  {D3Scale}  yScale       Y scale
 * @param  {Array}    xDomain0     Initial X domain
 * @param  {Array}    yDomain0     Initial Y domain
 * @param  {string}   xLabel       X axis label
 * @param  {string}   yLabel       Y axis label
 * @param  {string}   dataSet      data set name
 * @param  {D3Scale}  symbolScale  symbol scale
 */
ScatterPlot.draw = ( ref, width, height, margin, padding, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel, dataSet, symbolScale ) => {
    
    // Initialization.
    const svg = d3.select( ref.current.childNodes[ 0 ]);
    svg.selectAll( "*" ).remove();
    
    // Draw the points.
    let data = Data.getValues( dataSet );
    data.forEach(( datum ) => {
        svg.append( "path" )
        .attr( "d", symbolScale( datum[ 0 ]))
        .attr( "transform", d => "translate( " + Math.round( xScale( datum[ 1 ])) + ", " + Math.round( yScale( datum[ 2 ])) + " )" )
        .style( "fill", "none" )
        .style( "stroke", "black" );
    });
    
    // Draw the axes and the controls.
    Graph.drawAxes(     ref, width, height, margin, padding, true, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
    Graph.drawControls( ref, width, height, margin, padding, true, xScale, yScale, xDomain0, yDomain0, xLabel, yLabel );
};

export default ScatterPlot;
