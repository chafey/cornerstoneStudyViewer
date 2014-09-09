function loadThumbnails(context)
{
    var seriesList = $('#thumbnails');
    context.stacks.forEach(function(stack, stackIndex) {
        var seriesEntry = '<a class="list-group-item" + ' +
            'oncontextmenu="return false"' +
            'unselectable="on"' +
            'onselectstart="return false;"' +
            'onmousedown="return false;">' +
            '<div class="csthumbnail"' +
            'oncontextmenu="return false"' +
            'unselectable="on"' +
            'onselectstart="return false;"' +
            'onmousedown="return false;"></div>' +
            "<div class='text-center small'>" + stack.seriesDescription + '</div></a>';

        var seriesElement = $(seriesEntry).appendTo(seriesList);
        var thumbnail = $(seriesElement).find('div')[0];

        cornerstone.enable(thumbnail);
        cornerstone.loadAndCacheImage(context.stacks[stackIndex].imageIds[0]).then(function(image) {

            cornerstone.displayImage(thumbnail, image);
        });

        // make the first thumbnail "active"
        if(stackIndex === 0) {
            $(seriesElement).addClass('active');
        }

        $(seriesElement).on('click touchstart', function () {
            var element = $('.viewport')[0];
            cornerstoneTools.stackPrefetch.disable(element);
            // make this series visible
            var activeThumbnails = $(seriesList).find('a').each(function() {
                $(this).removeClass('active');
            });
            $(seriesElement).addClass('active');

            var viewportIndex = 0;
            displayStackInViewport(context, stackIndex, viewportIndex);
        });
    });
}