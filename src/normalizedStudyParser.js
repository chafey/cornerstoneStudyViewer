function getValue(study, series, instance, tag)
{
    var value;
    value = instance[tag];
    if(value !== undefined)
    {
        return value;
    }
    value = series.SharedTags[tag];
    if(value !== undefined)
    {
        return value;
    }
    return study.SharedTags[tag];

}

function parseNormalizedStudy(study)
{
    var allStacks = [];
    var currentStackIndex = 0;
    var seriesIndex = 0;
    study.Series.forEach(function(series) {
        var instance = series.Instances[0];


        // split series into different stacks
        var stacks = [];
        var modality = getValue(study, series, instance, "x00080060");
        if(modality === "CR" || modality === "MG" || modality ==="DX" || modality == "US" || modality == "XA")
        {
            series.Instances.forEach(function(instance)
            {
                var seriesDescription = getValue(study, series, instance, "x0008103E"); //SeriesDescription;

                if(seriesDescription === "" || seriesDescription === undefined) {
                    seriesDescription = getValue(study, series, instance, "x00181030"); // protocol name
                }
                if(seriesDescription === "" || seriesDescription === undefined) {
                    seriesDescription = "S:" + getValue(study, series, instance, "x00200011"); // series number
                    if(series.Instances.length !== 1) {
                        seriesDescription += " I:" + getValue(study, series, instance, "x00200013"); // instance number;
                    }
                }


                var stack = {
                    study: study,
                    series: series,
                    instance: instance,
                    seriesDescription: seriesDescription,
                    stackId : instance.InstanceId, // series number
                    imageIds: [],
                    currentImageIdIndex: 0,
                    frameRate: undefined,
                    seriesNumber: parseInt(getValue(study, series, instance, "x00200011"))
                }
                stacks.push(stack);
                allStacks.push(stack);

                var numFrames = getValue(study, series, stack.instance, "x00280008");
                var numFrames = parseInt(numFrames);
                if(numFrames > 0) {
                    for (var i = 0; i < numFrames; i++) {
                        stack.imageIds.push("dicomweb:/instances/" + instance.InstanceId + '/attachments/dicom/compressed-data' + "?frame=" + i);
                    }
                }
                else {
                    stack.imageIds.push("dicomweb:/instances/" + instance.InstanceId + '/attachments/dicom/compressed-data');
                }
                // TODO: Use frame increment pointer
                var frameRate = getValue(study, series, instance, "x00181063");
                if (frameRate !== undefined) {
                    stack.frameRate = 1000 / parseFloat(frameRate);
                }

                if(stack.frameRate !== undefined) {
                    stack.seriesDescription += "(" + stack.imageIds.length + " *)"
                }
                else {
                    if(stack.imageIds.length > 1) {
                        stack.seriesDescription += " (" + stack.imageIds.length + ")";
                    }
                }

            });
        }
        else {
            var seriesDescription = getValue(study, series, instance, "x0008103E"); //SeriesDescription;

            if(seriesDescription === "" || seriesDescription === undefined) {
                seriesDescription = getValue(study, series, instance, "x00181030"); // protocol name
            }
            if(seriesDescription === "" || seriesDescription === undefined) {
                seriesDescription = "S:" + getValue(study, series, instance, "x00200011"); // series number
                if(series.Instances.length !== 1) {
                    seriesDescription += " I:" + getValue(study, series, instance, "x00200013"); // instance number;
                }
            }

            var stack = {
                study: study,
                series: series,
                instance: instance,
                seriesDescription: seriesDescription,
                stackId : instance.InstanceId, // series number
                imageIds: [],
                currentImageIdIndex: 0,
                frameRate: undefined,
                seriesNumber: parseInt(getValue(study, series, instance, "x00200011"))

            }
            stacks.push(stack);
            allStacks.push(stack);

            function compare(a,b) {
                var in1 = getValue(study, series, a, "x00200013"); // instance number
                var in2 = getValue(study, series, b, "x00200013");
                if(parseInt(in1) < parseInt(in2))
                {
                    return -1;
                }
                if(parseInt(in1) > parseInt(in2))
                {
                    return 1;
                }
                return 0;
            }

            series.Instances.sort(compare);

            series.Instances.forEach(function(instance)
            {
                stack.imageIds.push("dicomweb:/instances/" + instance.InstanceId + '/attachments/dicom/compressed-data');
            });

            if(stack.imageIds.length > 1) {
                stack.seriesDescription += " (" + stack.imageIds.length + ")";
            }

        }

        seriesIndex++;
    });

    function compare(a,b) {
        if(a.seriesNumber < b.seriesNumber)
        {
            return -1;
        }
        if(a.seriesNumber > b.seriesNumber)
        {
            return 1;
        }
        var ai = getValue(study, a.series, a.instance, "x00200013");
        var bi = getValue(study, b.series, b.instance, "x00200013");
        if(ai === undefined || bi == undefined) {
            return 0;
        }
        var ai = parseInt(ai);
        var bi = parseInt(bi);
        if(ai < bi) {
            return -1;
        }
        if(ai > bi) {
            return 1;
        }
        return 0;
    }

    allStacks.sort(compare);


    return allStacks;
}