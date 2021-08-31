async function fetchComment(url,cid) {
    // Fetch comment data
    if (url && cid) {
        let response = await fetch(url + cid + '.json');
        let json = await response.json();
        return json;
    }
}

async function createComment(json,url,nest,parent) {
    // Create and append comment with all replies
    let childdata = json[1].data.children[0].data;

    let li = document.createElement("li");

    if (nest) {
        li.setAttribute("class","comment list-group-item bg-dark nested");
    } else {
        li.setAttribute("class","comment list-group-item bg-dark");
    }
    li.innerHTML = postInfo(childdata,true,false) + parseMDtoHTML(childdata.body_html);
    parent.appendChild(li);

    if (childdata.replies) {
        let ul = document.createElement("ul");
        ul.setAttribute("class","list-group list-group-flush");
        li.appendChild(ul);
        nest = !nest;

        for(let i=0;i < childdata.replies.data.children.length;i++){
            let jsondata = await fetchComment(url,childdata.replies.data.children[i].data.id)
            createComment(jsondata,url,nest,ul);
        }
    }
}

function updateSortingComments(url,id,sort) {
    // Change the displayed comments corresponding to the sorting
    // url : post id
    // id : subreddit name
    // sort : sorting methods

    col = document.getElementById("post-content");
    col.firstElementChild.removeChild(col.firstElementChild.children[col.firstElementChild.children.length-1]);
    fetchPosts(url,col,id,sort);
}