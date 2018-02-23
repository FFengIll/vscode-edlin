'use strict';

export enum Side {
    LEFT,
    RIGHT,
    BOTH
};

var candidate: Array<string> = ['\r\n', '\r', '\n'];

export function getNewLine(textline: String) {
    //wanna support all system (new line characters)
    var endline = '\r\n';
    for (var id in candidate) {
        var element = candidate[id];
        var last = textline.indexOf(element);
        //must have last=-1 if not found 
        if (last >= 0) {
            endline = element;
            break;
        }
    }
    return endline;
}

export function do_index(select) {
    var tag = '.';
    var newline = getNewLine(select);
    var lines = select.split(newline);
    var index = 1;
    for (var key in lines) {
        lines[key] = index + tag + ' ' + lines[key];
        index++;
    }

    return lines.join(newline);
}

function ltrim(str) { //删除左边的空格
    return str.replace(/(^\s*)/g, "");
}

function rtrim(str) { //删除右边的空格
    return str.replace(/(\s*$)/g, "");
}
export function do_split(select, splitor, keep: Boolean) {


    var newline = getNewLine(select);
    var lines = select.split(splitor);
    var res = '';
    if (keep) {
        res = lines.join(splitor + newline);
    } else {
        res = lines.join(newline);
    }
    return res;
}
export function do_combine(select) {
    var newline = getNewLine(select);
    var lines = select.split(newline);
    return lines.join('');
}
export function do_remove(select) {
    var newline = getNewLine(select);
    var text = select.split(newline);

    //get the non-blank line only
    var lines = text.filter((l) => {
        return l.trim().length > 0
    });
    return lines.join(newline);
}

export function do_trim(select, side) {
    var newline = getNewLine(select);
    var text = select.split(newline);

    // this where magic happens
    var lines = [];
    switch (side) {
        case Side.LEFT: //left
            text.forEach(l => {
                l = ltrim(l);
                lines.push(l);
            });
            break;
        case Side.RIGHT: //right
            text.forEach(l => {
                l = rtrim(l);
                lines.push(l);
            });
            break;
        default: //both side
            text.forEach(l => {
                l = l.trim();
                lines.push(l);
            });
            break;
    }
    return lines.join(newline);
}