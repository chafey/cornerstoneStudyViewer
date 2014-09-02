function parseStudy(study)
{
    var stacks = [];
    var currentStackIndex = 0;
    var seriesIndex = 0;
    study.seriesList.forEach(function(series) {
        var stack = {
            seriesDescription: series.seriesDescription,
            stackId : series.seriesNumber,
            imageIds: [],
            currentImageIdIndex: 0,
            frameRate: series.frameRate
        }
        if(series.numberOfFrames !== undefined) {
            var numberOfFrames = series.numberOfFrames;
            for(var i=0; i < numberOfFrames; i++) {
                var imageId = series.instanceList[0].imageId + "?frame=" + i;
                if(imageId.substr(0, 4) !== 'http') {
                    imageId = "dicomweb:/instances/" + imageId + '/file';
                }
                stack.imageIds.push(imageId);
            }
        } else {
            series.instanceList.forEach(function(image) {
                var imageId = image.imageId;
                if(image.imageId.substr(0, 4) !== 'http') {
                    imageId = "dicomweb:/instances/" + image.imageId + '/file';
                }
                stack.imageIds.push(imageId);
            });
        }
        seriesIndex++;
        stacks.push(stack);
    });
    return stacks;
}