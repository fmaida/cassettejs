/**
 * Maybe the following function is now obsolete, since most part of the work
 * is now done by FileSaver itself. I should investigate...
 */
function data_uri_to_blob(dataURI)
{
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

// -=-=---------------------------------------------------------------=-=-

/**
 * Maybe the following function is now obsolete, since most part of the work
 * is now done by FileSaver itself. I should investigate...
 */
function export_as_file(p_self)
{
    return new Blob([data_uri_to_blob(p_self.wave.dataURI)]);
}