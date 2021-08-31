function saveSettings() {
    //Save the settings
    changeColumnWidth(document.getElementById("columnwidth").value);
    manageList();
}

function manageList() {
    // Update the subreddits displayed and saved the list as a cookie
    var arr = tagify.value.map(item => item.value).join(',');

    if (arr.toString() && arr.toString() != localStorage.getItem("columns")) {
        localStorage.setItem("columns",arr.toString(),365);
        refresh();
    }
}

function changeColumnWidth(value) {
    // Change the width of the columns
    // value : value of the new column's width
    let max = 95;
    if (document.getElementById("columnWidthStyle")) {
        var sheet = document.getElementById("columnWidthStyle");
        sheet.innerHTML = ".col-3 {max-width:"+value+"%;flex: 0 0 "+value+"%;} .col-8{max-width:"+(max-value)+"%;flex: 0 0 "+(max-value)+"%;}";
    } else {
        var sheet = document.createElement('style')
        sheet.id = "columnWidthStyle";
        sheet.innerHTML = ".col-3 {max-width:"+value+"%;flex: 0 0 "+value+"%;} .col-8{max-width:"+(max-value)+"%;flex:0 0 "+(max-value)+"%;}";
        document.body.appendChild(sheet);;
    }
    if (value && value != localStorage.getItem("columnwidth")) {
        localStorage.setItem("columnwidth",value);
    }
}


function updateTextInput(value) {
    // Update text input to show range value
    // value : value of the range input
    if (value === undefined) {
        value = document.getElementById("columnwidth").value;
    }
    document.getElementById('textInput').value=value+"%"; 
}