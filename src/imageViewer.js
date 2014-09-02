function initializeViewportWithStack(context, viewportIndex, stackIndex)
{
    var viewport = context.viewports[viewportIndex];
    var stack = context.stacks[stackIndex];

    // image enable the dicomImage element and activate a few tools
    var element = $('.viewport')[viewportIndex];
    var parent = $(element).parent();
    var childDivs = $(parent).find('.overlay');
    var topLeft = $(childDivs[0]).find('div');
    $(topLeft[0]).text(context.study.patientName);
    $(topLeft[1]).text(context.study.patientId);
    var topRight= $(childDivs[1]).find('div');
    $(topRight[0]).text(context.study.studyDescription);
    $(topRight[1]).text(context.study.studyDate);
    var bottomLeft = $(childDivs[2]).find('div');
    var bottomRight = $(childDivs[3]).find('div');

    viewport.element = element;
    viewport.stackIndex = stackIndex;

    function onNewImage(e) {
        // if we are currently playing a clip then update the FPS
        var playClipToolData = cornerstoneTools.getToolState(element, 'playClip');
        if(playClipToolData !== undefined && playClipToolData.data.length > 0 && playClipToolData.data[0].intervalId !== undefined && e.detail.frameRate !== undefined) {
            $(bottomLeft[0]).text("FPS: " + Math.round(e.detail.frameRate));
            //console.log('frameRate: ' + e.detail.frameRate);
        } else {
            if($(bottomLeft[0]).text().length > 0) {
                $(bottomLeft[0]).text("");
            }
        }
        $(bottomLeft[2]).text("Image #" + (context.stacks[viewport.stackIndex].currentImageIdIndex + 1) + "/" + context.stacks[viewport.stackIndex].imageIds.length);
    }
    element.addEventListener("CornerstoneNewImage", onNewImage, false);

    function onImageRendered(e) {
        $(bottomRight[0]).text("Zoom:" + e.detail.viewport.scale.toFixed(2));
        $(bottomRight[1]).text("WW/WL:" + Math.round(e.detail.viewport.voi.windowWidth) + "/" + Math.round(e.detail.viewport.voi.windowCenter));
        $(bottomLeft[1]).text("Render Time:" + e.detail.renderTimeInMs + " ms");
    }
    element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

    var imageId = stack.imageIds[0];

    // image enable the dicomImage element
    cornerstone.enable(element);
    cornerstone.loadAndCacheImage(imageId).then(function(image) {
        cornerstone.displayImage(element, image);

        // start playing the clip if a framerate is provided
        if(stack.frameRate !== undefined) {
            cornerstone.playClip(element, stack.frameRate);
        }

        cornerstoneTools.mouseInput.enable(element);
        cornerstoneTools.mouseWheelInput.enable(element);
        cornerstoneTools.touchInput.enable(element);

        // Enable all tools we want to use with this element
        cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
        cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
        cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
        cornerstoneTools.probe.enable(element);
        cornerstoneTools.length.enable(element);
        cornerstoneTools.ellipticalRoi.enable(element);
        cornerstoneTools.rectangleRoi.enable(element);
        cornerstoneTools.wwwcTouchDrag.activate(element);
        cornerstoneTools.zoomTouchPinch.activate(element);


        // stack tools
        cornerstoneTools.addStackStateManager(element, ['playClip']);
        cornerstoneTools.addToolState(element, 'stack', stack);
        cornerstoneTools.stackScrollWheel.activate(element);
        cornerstoneTools.stackPrefetch.enable(element);


        function disableAllTools()
        {
            cornerstoneTools.wwwc.disable(element);
            cornerstoneTools.pan.activate(element, 2); // 2 is middle mouse button
            cornerstoneTools.zoom.activate(element, 4); // 4 is right mouse button
            cornerstoneTools.probe.deactivate(element, 1);
            cornerstoneTools.length.deactivate(element, 1);
            cornerstoneTools.angle.deactivate(element, 1);
            cornerstoneTools.ellipticalRoi.deactivate(element, 1);
            cornerstoneTools.rectangleRoi.deactivate(element, 1);
            cornerstoneTools.stackScroll.deactivate(element, 1);
            cornerstoneTools.wwwcTouchDrag.deactivate(element);
            cornerstoneTools.zoomTouchDrag.deactivate(element);
            cornerstoneTools.panTouchDrag.deactivate(element);
            cornerstoneTools.stackScrollTouchDrag.deactivate(element);
        }

        var buttons = $('button');
        // Tool button event handlers that set the new active tool
        $(buttons[0]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.wwwc.activate(element, 1);
            cornerstoneTools.wwwcTouchDrag.activate(element);
        });
        $(buttons[1]).on('click touchstart',function() {
            disableAllTools();
            var viewport = cornerstone.getViewport(element);
            if(viewport.invert === true) {
                viewport.invert = false;
            }
            else {
                viewport.invert = true;
            }
            cornerstone.setViewport(element, viewport);
        });
        $(buttons[2]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.zoom.activate(element, 5); // 5 is right mouse button and left mouse button
            cornerstoneTools.zoomTouchDrag.activate(element);
        });
        $(buttons[3]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.pan.activate(element, 3); // 3 is middle mouse button and left mouse button
            cornerstoneTools.panTouchDrag.activate(element);
        });
        $(buttons[4]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.stackScroll.activate(element, 1);
            cornerstoneTools.stackScrollTouchDrag.activate(element);
        });
        $(buttons[5]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.length.activate(element, 1);
        });
        $(buttons[6]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.angle.activate(element, 1);
        });
        $(buttons[7]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.probe.activate(element, 1);
        });
        $(buttons[8]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.ellipticalRoi.activate(element, 1);
        });
        $(buttons[9]).on('click touchstart',function() {
            disableAllTools();
            cornerstoneTools.rectangleRoi.activate(element, 1);
        });
        $(buttons[10]).on('click touchstart',function() {
            var frameRate = context.stacks[viewport.stackIndex].frameRate;
            if(frameRate === undefined) {
                frameRate = 10;
            }
            cornerstoneTools.playClip(element, 31);
        });
        $(buttons[11]).on('click touchstart',function() {
            cornerstoneTools.stopClip(element);
        });

        $(buttons[0]).tooltip();
        $(buttons[1]).tooltip();
        $(buttons[2]).tooltip();
        $(buttons[3]).tooltip();
        $(buttons[4]).tooltip();
        $(buttons[5]).tooltip();
        $(buttons[6]).tooltip();
        $(buttons[7]).tooltip();
        $(buttons[8]).tooltip();
        $(buttons[9]).tooltip();
        $(buttons[10]).tooltip();
        $(buttons[11]).tooltip();
    });

}

function displayStackInViewport(context, stackIndex, viewportIndex)
{
    cornerstone.loadAndCacheImage(context.stacks[stackIndex].imageIds[0]).then(function(image) {
        var viewport = context.viewports[viewportIndex];
        var element = viewport.element;//$('.viewport')[viewportIndex];
        var defViewport = cornerstone.getDefaultViewport(element, image);
        viewport.stackIndex = stackIndex;
        cornerstone.displayImage(element, image, defViewport);
        cornerstone.fitToWindow(element);
        var stackState = cornerstoneTools.getToolState(element, 'stack');
        stackState.data[0] = context.stacks[stackIndex];
        stackState.data[0].currentImageIdIndex = 0;
        cornerstoneTools.stackPrefetch.enable(element);

        if(context.stacks[stackIndex].frameRate !== undefined) {
            cornerstoneTools.playClip(element, context.stacks[stackIndex].frameRate);
        }
    });
}