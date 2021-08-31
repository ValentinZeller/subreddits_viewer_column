function showPost(url,id) {
    // Display a post and the comments
    // url : post id
    // id : subreddit name

    hideSubs(id);
    var row = document.getElementById("row");

    //Close button
    if (!document.getElementById("close-post")) {
        closebutton = document.createElement("button");
        closebutton.setAttribute("class","btn btn-outline-danger close-button");
        closebutton.setAttribute("id","close-post");
        closebutton.setAttribute("onclick","hidePost(\""+ id +"\");");
        closebutton.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='red' class='bi bi-arrow-return-left' viewBox='0 0 16 16'> <path fill-rule='evenodd' d='M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z'/></svg>";
        row.children[id].firstChild.firstChild.appendChild(closebutton);
    }

    if (document.getElementById("post-content")) {
        // Remove the post column if there is already one opened
        row.removeChild(document.getElementById("post-content"));
    }

    // Creation of the post column
    var col = document.createElement("div");
    col.setAttribute("class","col-8");
    col.setAttribute("id","post-content");
    row.appendChild(col);

    // Get post content by his link
    posturl = "https://www.reddit.com"+url;
    fetchPosts(posturl,col,id,"confidence");
}

function hidePost(id) {
    // Remove the post column and show all the subreddit columns
    // id : subreddit name

    var row = document.getElementById("row");
    row.children[id].firstChild.firstChild.removeChild(row.children[id].firstChild.firstChild.lastChild);
    row.removeChild(document.getElementById("post-content"));
    showSubs(id);
    backToTop(id);
}

function hideSubs(id) {
    // Hide the subreddit columns except the subreddit of the current opened post
    // id : subreddit name

    var row = document.getElementById("row");
    for (i=1;i<row.childElementCount;i++) {
        if (row.children[i].id != id) {
            row.children[i].style.display = "none";
        }
    }
}

function showSubs(id) {
    // Show all the subreddits and scroll horizontaly to the last subreddit opened
    // id : subreddit name

    var row = document.getElementById("row");
    for (i=1;i<row.childElementCount;i++) {
        row.children[i].style = null;
    }

    // Scroll horizontaly
    row.scrollLeft = document.getElementById(id).getBoundingClientRect().left -90 ;
    //document.getElementById("navcol").style.height = document.getElementById("navcol2").getBoundingClientRect().height+"px";
}

function refresh() {
    // Refresh the page
    document.location.reload();
}

function backToTop(id) {
    // Scroll to the top a subreddit column
    // id : subreddit name

    var col = document.getElementById(id);
    col.scrollTop = 0;
}