function parseStudy(study)
{
    var stacks = [];
    var currentStackIndex = 0;
    var seriesIndex = 0;
    study.seriesList.forEach(function(series) {

        var seriesDescription = series.seriesDescription;

        if(seriesDescription === "" || seriesDescription == "(null)") {
            seriesDescription = series.protocolName;
        }
        if(seriesDescription === "" || seriesDescription == "(null)") {
            seriesDescription = "S:" + series.seriesNumber;
            if(series.instanceList.length === 1) {
                seriesDescription += "/I:" + series.instanceList[0].instanceNumber;
            }
        }

        var stack = {
            series: series,
            seriesDescription: seriesDescription,
            stackId : series.seriesNumber,
            imageIds: [],
            currentImageIdIndex: 0,
            frameRate: series.frameRate
        }

        series.instanceList.forEach(function(image) {
            var imageId = image.imageId;
            if(image.numberOfFrames === undefined) {
                if(image.imageId.substr(0, 4) !== 'http') {
                    //imageId = "dicomweb:/instances/" + image.imageId + '/file';
                    imageId = "dicomweb:/instances/" + image.imageId + '/attachments/dicom/compressed-data';
                }
            }
            else {
                for(var i=0; i < image.numberOfFrames; i++) {
                    if(imageId.substr(0, 4) !== 'http') {
                        imageId = "dicomweb:/instances/" + image.imageId + '/file' + "?frame=" + i;
                    }
                    stack.imageIds.push(imageId);
                }
                if(image.frameRate !== undefined)
                {
                    stack.frameRate = image.frameRate;
                }
            }
            stack.imageIds.push(imageId);
        });

        if(stack.frameRate !== undefined) {
            stack.seriesDescription += "(clip)"
        }

        if(stack.imageIds.length > 1) {
            stack.seriesDescription += " (" + stack.imageIds.length + ")";
        }
        seriesIndex++;
        stacks.push(stack);
    });
    return stacks;
}