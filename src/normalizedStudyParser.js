// returns a dicom field from a normalized study.
function getValue(study, series, instance, tag)
{
    var value;
    if(instance === undefined)
    {
        var i =0;
    }
    else{
        value = instance[tag];
        if(value !== undefined)
        {
            return value;
        }
    }

    value = series.SharedTags[tag];
    if(value !== undefined)
    {
        return value;
    }
    return study.SharedTags[tag];
}

// make an orthanc uri given an instanceId and optional frame
function makeUri(instanceId, frame)
{
    var uri = "dicomweb:/instances/" + instanceId + '/attachments/dicom/compressed-data';
    if(frame !== undefined) {
        uri += "?frame=" + frame;
    }
    return uri;
}

function getStackDescription(study, series, instance)
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
    return seriesDescription;
}

function expandMultiFrameImageIds(stack, study, series, instance)
{
    var numFrames = getValue(study, series, instance, "x00280008");
    var numFrames = parseInt(numFrames);
    if(numFrames > 0) {
        for (var i = 0; i < numFrames; i++) {
            stack.imageIds.push(makeUri(instance.InstanceId, i));
            stack.instances.push(instance);
        }
    }
    else {
        stack.imageIds.push(makeUri(instance.InstanceId));
        stack.instances.push(instance);
    }
}

function handleCineClip(stack, study, series, instance)
{
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
}

function splitSeriesIntoSingleImageStacks(study, series)
{
    var stacks = [];
    series.Instances.forEach(function(instance)
    {
        // Create a new stack object
        var seriesDescription = getStackDescription(study, series, instance);
        var stack = {
            study: study,
            series: series,
            seriesDescription: seriesDescription,
            stackId : instance.InstanceId, // series number
            instances: [],
            imageIds: [],
            currentImageIdIndex: 0,
            frameRate: undefined,
            seriesNumber: parseInt(getValue(study, series, instance, "x00200011"))
        }
        stacks.push(stack);

        // If this is a multiframe instance, expand each frame into its own ImageId
        expandMultiFrameImageIds(stack, study, series, instance);

        handleCineClip(stack, study, series, instance);
    });
    return stacks;
}

function createStack(study, series, instance)
{
    var seriesDescription = getStackDescription(study, series, instance);

    var stack = {
        study: study,
        series: series,
        instance: instance,
        seriesDescription: seriesDescription,
        stackId : instance.InstanceId, // series number
        instances: [],
        imageIds: [],
        currentImageIdIndex: 0,
        frameRate: undefined,
        seriesNumber: parseInt(getValue(study, series, instance, "x00200011"))
    }
    return stack;
}

function sortImagesInStack(stack, study, series)
{
    function compareImages(a,b) {
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

    series.Instances.sort(compareImages);
}

function sortSeries(allStacks, study)
{
    function compareSeries(a,b) {
        if(a.seriesNumber < b.seriesNumber)
        {
            return -1;
        }
        if(a.seriesNumber > b.seriesNumber)
        {
            return 1;
        }
        var ai = getValue(study, a.series, a.instances[a.currentImageIdIndex], "x00200013");
        var bi = getValue(study, b.series, b.instances[a.currentImageIdIndex], "x00200013");
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

    allStacks.sort(compareSeries);
}

function createStackForSeries(study, series, instance)
{
    var stack = createStack(study, series, instance);

    sortImagesInStack(stack, study, series);

    series.Instances.forEach(function(instance)
    {
        stack.imageIds.push(makeUri(instance.InstanceId));
        stack.instances.push(instance);
    });

    if(stack.imageIds.length > 1) {
        stack.seriesDescription += " (" + stack.imageIds.length + ")";
    }

    return [stack];
}

function parseNormalizedStudy(study)
{
    var allStacks = [];
    var currentStackIndex = 0;
    study.Series.forEach(function(series) {
        var instance = series.Instances[0];

        // split series into different stacks
        var stacks = [];
        var modality = getValue(study, series, instance, "x00080060");
        if(modality === "CR" || modality === "MG" || modality ==="DX" || modality == "US" || modality == "XA")
        {
            stacks = splitSeriesIntoSingleImageStacks(study, series);
        }
        else {
            stacks = createStackForSeries(study, series, instance);
        }

        stacks.forEach(function(stack) {
            allStacks.push(stack);
        });
    });

    sortSeries(allStacks, study);

    return allStacks;
}