import React from 'react';
import * as d3 from 'd3';
import './Graph.css';

// Graph in an SVG element.
const Graph = React.forwardRef(( props, ref ) => {
    
    // Initialization.
    const buttonSize = 30;
    let { width, height, onMouseDown, onMouseUp, onZoomIn, onZoomOut } = props;
    
    // Return the component.
    return <div style={{width: width, height: height}} className="parent">
            <svg width={width} height={height} onMouseDown={onMouseDown} onMouseMove={onMouseUp} onMouseUp={onMouseUp} ref={ref} />
            <input type="button" value="+" onClick={onZoomIn } style={{ width: buttonSize, height: buttonSize, top: ( height + 1 - buttonSize ), left: 1 }} />
            <input type="button" value="-" onClick={onZoomOut} style={{ width: buttonSize, height: buttonSize, top: ( height + 1 - buttonSize ), left: 1 + buttonSize }} />
        </div>;
});
    
// Zooms in two dimensions.
Graph.onZoom2D = ( xScale, yScale, xMin0, xMax0, yMin0, yMax0, isIn ) => {
    const d = 8, f = ( d - 1 ) / ( 2 * d );
    let xDomain = xScale.domain(), xMin = xDomain[ 0 ], xMax = xDomain[ 1 ], xRange = xMax - xMin,
        yDomain = yScale.domain(), yMin = yDomain[ 0 ], yMax = yDomain[ 1 ], yRange = yMax - yMin;
    if( isIn ) {
        xMin = Math.min( xMin0 + ( xMax0 - xMin0 ) * f, xMin + xRange / d );
        xMax = Math.max( xMax0 - ( xMax0 - xMin0 ) * f, xMax - xRange / d );
        yMin = Math.min( yMin0 + ( yMax0 - yMin0 ) * f, yMin + yRange / d );
        yMax = Math.max( yMax0 - ( yMax0 - yMin0 ) * f, yMax - yRange / d );
    } else {
        xMin = Math.max( xMin0, xMin - xRange / ( d - 2 ));
        xMax = Math.min( xMax0, xMax + xRange / ( d - 2 ));
        yMin = Math.max( yMin0, yMin - yRange / ( d - 2 ));
        yMax = Math.min( yMax0, yMax + yRange / ( d - 2 ));
    }
    xScale.domain([ xMin, xMax ]);
    yScale.domain([ yMin, yMax ]);
};
    
// Zooms in one dimension.
Graph.onMouseDown = ( height, width, margin, padding, scrollSize, xScale, yScale, xMin0, xMax0, yMin0, yMax0, event ) => {
    const endCapSize = 0.8 * scrollSize;
    let x0 = event.nativeEvent.offsetX, y0 = event.nativeEvent.offsetY,
    x = margin.left + padding.left,
    y = padding.top,
    w = width - padding.right - x + 1,
    h = height - margin.bottom - padding.bottom - y + 1,
    xMin = x + w * ( xScale.domain()[ 0 ] - xMin0 ) / ( xMax0 - xMin0 ),
    xMax = x + w * ( xScale.domain()[ 1 ] - xMin0 ) / ( xMax0 - xMin0 ),
    yMin = y + h * ( 1 - ( yScale.domain()[ 0 ] - yMin0 ) / ( yMax0 - yMin0 )),
    yMax = y + h * ( 1 - ( yScale.domain()[ 1 ] - yMin0 ) / ( yMax0 - yMin0 )),
    xDown,
    yDown,
    isX = false,
    isY = false,
    isMin = false,
    isMax = false;
    if(( margin.left + padding.left <= x0 ) && ( x0 <= width - padding.right ) && ( height - scrollSize <= y0 ) && ( y0 <= height )) {
        xDown = x0;
        yDown = y0;
        isX = true;
        if( x0 < xMin + endCapSize ) {
            isMin = true;
        } else if( x0 > xMax - endCapSize ) {
            isMax = true;
        }
    } else if(( 0 <= x0 ) && ( x0 <= scrollSize ) && ( padding.top <= y0 ) && ( y0 <= height - margin.bottom - padding.bottom )) {
        xDown = x0;
        yDown = y0;
        isY = true;
        if( y0 < yMax + endCapSize ) {
            isMax = true;
        } else if( y0 > yMin - endCapSize ) {
            isMin = true;
        }
    }
    return [ xDown, yDown, isX, isY, isMin, isMax ];
};
Graph.onMouseUp = ( xDown, yDown, isX, isY, isMin, isMax, height, width, margin, padding, scrollSize, xScale, yScale, xMin0, xMax0, yMin0, yMax0, event ) => {
    let xUp = event.nativeEvent.offsetX, yUp = event.nativeEvent.offsetY;
    if( isX ) {
        let x = margin.left + padding.left,
            w = width - padding.right - x + 1,
            dif = ( xScale.domain()[ 1 ] - xScale.domain()[ 0 ]) * ( xUp - xDown ) / ( w - x );
        if( isMin ) {
            if( dif < xMin0 - xScale.domain()[ 0 ]) {
                dif = xMin0 - xScale.domain()[ 0 ];
            }
            xScale.domain([ xScale.domain()[ 0 ] + dif, xScale.domain()[ 1 ]]);
        } else if( isMax ) {
            if( dif > xMax0 - xScale.domain()[ 1 ]) {
                dif = xMax0 - xScale.domain()[ 1 ];
            }
            xScale.domain([ xScale.domain()[ 0 ], xScale.domain()[ 1 ] + dif ]);
        } else {
            if( dif < xMin0 - xScale.domain()[ 0 ]) {
                dif = xMin0 - xScale.domain()[ 0 ];
            }
            if( dif > xMax0 - xScale.domain()[ 1 ]) {
                dif = xMax0 - xScale.domain()[ 1 ];
            }
            xScale.domain([ xScale.domain()[ 0 ] + dif, xScale.domain()[ 1 ] + dif ]);
        }
    } else if( isY ) {
        let y = padding.top,
            h = height - margin.bottom - padding.bottom - y + 1,
            dif = ( yScale.domain()[ 1 ] - yScale.domain()[ 0 ]) * ( yDown - yUp ) / ( h - y );
        if( isMin ) {
            if( dif < yMin0 - yScale.domain()[ 0 ]) {
                dif = yMin0 - yScale.domain()[ 0 ];
            }
            yScale.domain([ yScale.domain()[ 0 ] + dif, yScale.domain()[ 1 ]]);
        } else if( isMax ) {
            if( dif > yMax0 - yScale.domain()[ 1 ]) {
                dif = yMax0 - yScale.domain()[ 1 ];
            }
            yScale.domain([ yScale.domain()[ 0 ], yScale.domain()[ 1 ] + dif ]);
        } else {
            if( dif < yMin0 - yScale.domain()[ 0 ]) {
                dif = yMin0 - yScale.domain()[ 0 ];
            }
            if( dif > yMax0 - yScale.domain()[ 1 ]) {
                dif = yMax0 - yScale.domain()[ 1 ];
            }
            yScale.domain([ yScale.domain()[ 0 ] + dif, yScale.domain()[ 1 ] + dif ]);
        }
    }
    if( event.type === "mouseup" ) {
        isX = false;
        isY = false;
        isMin = false;
        isMax = false;
    } else {
        xDown = xUp;
        yDown = yUp;
    }
    return [ xDown, yDown, isX, isY, isMin, isMax ];
};
    
// Draws the graph.
Graph.draw = ( ref, height, width, margin, padding, scrollSize, xScale, yScale, xMin0, xMax0, yMin0, yMax0, xLabel, yLabel, size ) => {
    
    // Initialization.
    const svg = d3.select( ref.current ),
        halfScrollSize = scrollSize / 2;
    
    // Draw the X axis.
    svg.append( "rect" )
        .attr( "x", 0 )
        .attr( "y", height - margin.bottom )
        .attr( "width", width )
        .attr( "height", margin.bottom )
        .style( "fill", "#ffffff" );
    svg.append( "g" )
        .attr( "class", "axis" )
        .attr( "transform", "translate( 0, " + ( height - margin.bottom ) + " )" )
        .call( d3.axisBottom( xScale ).ticks( 3 ).tickFormat(( x ) => { return x.toFixed( 1 )}));
    svg.append( "text" )
        .attr( "transform", "translate( " + ( width / 2 ) + " ," + ( height - padding.bottom ) + ")" )
        .style( "text-anchor", "middle" )
        .text( xLabel );
        
    // Draw the Y axis.
    svg.append( "rect" )
        .attr( "x", 0 )
        .attr( "y", 0 )
        .attr( "width", margin.left )
        .attr( "height", height )
        .style( "fill", "#ffffff" );
    svg.append( "g" )
        .attr( "class", "axis" )
        .attr( "transform", "translate( " + margin.left + ", 0 )" )
        .call( d3.axisLeft( yScale ).ticks( 3 ).tickFormat(( x ) => { return x.toFixed( 1 )}));
    svg.append( "text" )
        .attr( "x", margin.left )
        .attr( "y", padding.top * 0.7 )
        .style( "text-anchor", "middle" )
        .text( yLabel );
    
    // Draw the X scrollbar.
    let x = margin.left + padding.left,
        w = width - padding.right - x + 1,
        xMin = x + w * ( xScale.domain()[ 0 ] - xMin0 ) / ( xMax0 - xMin0 ),
        xMax = x + w * ( xScale.domain()[ 1 ] - xMin0 ) / ( xMax0 - xMin0 );
    svg.append( "rect" )
        .attr( "x", x )
        .attr( "y", height - scrollSize )
        .attr( "width", w )
        .attr( "height", scrollSize )
        .style( "fill", "#eeeeee" );
    svg.append( "line" )
        .attr( "x1", xMin + halfScrollSize )
        .attr( "y1", height - halfScrollSize )
        .attr( "x2", xMax - halfScrollSize )
        .attr( "y2", height - halfScrollSize )
        .style( "stroke-width", scrollSize )
        .style( "stroke", "#cccccc" )
        .style( "stroke-linecap", "round" );
    svg.append( "line" )
        .attr( "x1", xMin + halfScrollSize + 1 )
        .attr( "y1", height - scrollSize )
        .attr( "x2", xMin + halfScrollSize + 1 )
        .attr( "y2", height )
        .style( "stroke-width", 1 )
        .style( "stroke", "#ffffff" );
    svg.append( "line" )
        .attr( "x1", xMax - halfScrollSize - 1 )
        .attr( "y1", height - scrollSize )
        .attr( "x2", xMax - halfScrollSize - 1 )
        .attr( "y2", height )
        .style( "stroke-width", 1 )
        .style( "stroke", "#ffffff" );
        
    // Draw the Y scrollbar.
    let y = padding.top,
        h = height - margin.bottom - padding.bottom - y + 1,
        yMin = y + h * ( 1 - ( yScale.domain()[ 0 ] - yMin0 ) / ( yMax0 - yMin0 )),
        yMax = y + h * ( 1 - ( yScale.domain()[ 1 ] - yMin0 ) / ( yMax0 - yMin0 ));
    svg.append( "rect" )
        .attr( "x", 0 )
        .attr( "y", y )
        .attr( "width", scrollSize )
        .attr( "height", h )
        .style( "fill", "#eeeeee" );
    svg.append( "line" )
        .attr( "x1", halfScrollSize )
        .attr( "y1", yMax + halfScrollSize )
        .attr( "x2", halfScrollSize )
        .attr( "y2", yMin - halfScrollSize )
        .style( "stroke-width", scrollSize )
        .style( "stroke", "#cccccc" )
        .style( "stroke-linecap", "round" );
    svg.append( "line" )
        .attr( "x1", 0 )
        .attr( "y1", yMax + halfScrollSize + 1 )
        .attr( "x2", scrollSize )
        .attr( "y2", yMax + halfScrollSize + 1 )
        .style( "stroke-width", 1 )
        .style( "stroke", "#ffffff" );
    svg.append( "line" )
        .attr( "x1", 0 )
        .attr( "y1", yMin - halfScrollSize - 1 )
        .attr( "x2", scrollSize )
        .attr( "y2", yMin - halfScrollSize - 1 )
        .style( "stroke-width", 1 )
        .style( "stroke", "#ffffff" );
};

export default Graph;
