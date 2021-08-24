function createColumns(columnlist) {
    // Create all the subreddit columns
    // columnlist : List of subreddits

    // Content block
    var row = document.getElementById("row");
    
    columns = columnlist.split(",");
    columns.forEach(element => {

        // Creation of a content block (card div)
        var card = createColumn(element);
        fetchSubreddit(element,card,'hot');
    });
}

function createColumn(element) {
    // Content block
    var row = document.getElementById("row");

    var col = document.createElement("div");
    col.setAttribute("class","col-3");
    col.setAttribute("data-spy","scroll");
    col.setAttribute("id",element);
    col.setAttribute("data-target","#"+element);
    col.setAttribute("data-offset","0");

    // Creation of a content block (card div)
    var card = document.createElement("div");
    card.setAttribute("class","card card-block text-white bg-dark mb-3 rounded-0");

    // Creation of the header (sorting buttons)
    var cardheader = document.createElement("div");
    cardheader.setAttribute("class","card-header");
    cardheader.innerHTML = "<span>"+element+"</span>";
    cardheader.innerHTML += " <button type='button' onclick='updateSorting(\""+element+"\",\"hot\",0);' class='btn btn-dark sort'>Hot</button>";
    cardheader.innerHTML += " <button type='button' onclick='updateSorting(\""+element+"\",\"new\",0);' class='btn btn-dark sort'>New</button>";        
    cardheader.innerHTML += " <button type='button' onclick='updateSorting(\""+element+"\",\"rising\",0);' class='btn btn-dark sort'>Rising</button>";        
    cardheader.innerHTML += "<span class='dropdown'><button class='btn btn-dark dropdown-toggle sort' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>Top</button><div class='dropdown-menu' aria-labelledby='dropdownMenuButton'><button type='button' onclick='updateSorting(\""+element+"\",\"top\",\"hour\");' class='btn btn-dark sort'>Now</button><br/><button type='button' onclick='updateSorting(\""+element+"\",\"top\",\"day\");' class='btn btn-dark sort'>Today</button><br/><button type='button' onclick='updateSorting(\""+element+"\",\"top\",\"week\");' class='btn btn-dark sort'>This Week</button><br/><button type='button' onclick='updateSorting(\""+element+"\",\"top\",\"month\");' class='btn btn-dark sort'>This Month</button><br/><button type='button' onclick='updateSorting(\""+element+"\",\"top\",\"year\");' class='btn btn-dark sort'>This Year</button><br/><button type='button' onclick='updateSorting(\""+element+"\",\"top\",\"all\");' class='btn btn-dark sort'>All Time</button></div></span>";

    // Creation of the body (content block)
    var cardbody = document.createElement("div");
    cardbody.setAttribute("class","card-body");
    
    card.appendChild(cardheader);
    col.appendChild(card);
    row.appendChild(col);

    // Scroll the top of a column by clicking on the header
    cardheader.addEventListener("click",function() {
        backToTop(element);
    });

    return card;
}

function updateSorting(url,sort,time) {
    // Change the displayed posts corresponding to the sorting
    // url : name of the subreddit
    // sort : sorting method (new,hot,rising,top)
    // time : for the top sorting (hour,day,week,month,year,all)

    card = document.getElementById(url).firstElementChild;
    card.removeChild(card.children[1]);
    fetchSubreddit(url,card,sort,time);
}

function fetchSubreddit(url,card,sort,time,after) {
    // Get subreddit posts
    // url : name of the subreddit
    // card : card element
    // sort : sorting method (new,hot,rising,top)
    // time : for the top sorting (hour,day,week,month,year,all)
    
     if (url) {
        fetch('https://www.reddit.com/r/' + url + '/' + sort + '/.json?after=' + after + '&limit=25&t=' + time).then(function(response) {
            return response.json();
        }).then(function(json) {
            createSubreddit(url,card,json);

            //More post when scrolling
            document.getElementById(url).addEventListener("scroll",function() {
                col = document.getElementById(url);
                if (col.scrollTop >= col.scrollHeight - col.offsetHeight) {
                    fetchSubreddit(url,card,sort,time,json.data.after);
                }
            });
        });
    }
}

function createSubreddit(url,card,json) {
    // After fetching, creation of the content elements 
    var links = ''; 
    for (var i = 0; i < json.data.children.length; i++) {
        // For each subreddit post
        // Creation of the post element
        let childdata = json.data.children[i].data;
        links += "<li onclick='showPost(\""+ childdata.permalink +"\",\""+ url +"\");' class='list-group-item bg-dark' id='"+ childdata.id +"'>";

        if (childdata.preview && childdata.selftext == "") {
            // if the post have a preview and have no text it's a spoiler or a media content
            if (childdata.thumbnail == "spoiler") {
                // Spoiler
                links +="<div class='thumb-self'></div>";
            } else {
                // Media content
                links+= "<img class='post-thumb' src='" + childdata.thumbnail + "'>";
            }
        } else {
            // Self text post
            links +="<div class='thumb-self'></div>";
        }

        // Post title
        links += "<p href='https://www.reddit.com/" + childdata.permalink + "'>" + childdata.title + "</p></li>";
        // Post information (after content)
        links += postInfo(childdata,false,true);
    }

    // List element to contain the posts and then append the list to the card
    sub = document.getElementById("list-"+url);
    if (sub == "" || sub == null) {
        sub = document.createElement("ul");
        sub.setAttribute("class","list-group list-group-flush");
        sub.setAttribute("id","list-"+url);
        //json.data.after
    }
    sub.innerHTML += links;
    card.appendChild(sub);
}

function parseMDtoHTML(md) {
    // Transform md content into html

    var parser = new DOMParser;
    var dom = parser.parseFromString(md,"text/html");
    return dom.body.textContent;
}

function postInfo(data,inPost,haveComments) {
    // Get the post information
    // data : json data of the post
    // inPost : bool to know if it's in the post column or subreddit column or comment section
    // haveComments : bool to know if there are comments

    info = "<p class='post-info'>"+ data.ups + " 🡅  - " + "<a class='user-link' href='https://www.reddit.com/user/"+ data.author +"'>" + data.author + "</a>";
    if (inPost) {
        if (data.author_flair_text) {
            info += " | "+data.author_flair_text;
        }
    }
    if (haveComments) {
        info+=" - " +data.num_comments+" comments";
    }
    var date = new Date(0);
    date.setUTCSeconds(data.created_utc);

    //Date display
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    

    info += "<br/><span class='date'>" + day + "/" + month + "/" + year + " - " + hour + ":" + minute + ":" + second + "</span></p>";
    return info;
}

function playSoundAndVideo() {
    // Sync sound and video when playing or pausing a video

    video = document.getElementById('videoIN');
    audio = document.getElementById('audioIN');
    if (video.onplay) {
        audio.currentTime = video.currentTime;
        audio.play();
    } else if (video.paused) {
        audio.currentTime = video.currentTime;
        audio.pause();
    }
}

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

function updateSortingComments(url,id,sort) {
    // Change the displayed comments corresponding to the sorting
    // url : post id
    // id : subreddit name
    // sort : sorting methods

    col = document.getElementById("post-content");
    col.firstElementChild.removeChild(col.firstElementChild.children[col.firstElementChild.children.length-1]);
    fetchPosts(url,col,id,sort);
}

function fetchPosts(url,col,id,sort) {
    // Get post and comments
    // url : post id
    // col : column element
    // id : subreddit name
    // sort : sorting methods

    if (url) {
        fetch(url + '.json?limit=100&sort='+ sort).then(function(response) {
            return response.json();
        }).then(async function(json) {

            if (col.firstChild == null) { 
                col.innerHTML = postContent(json,id,url);
            }

            let list = document.createElement("ul");
            list.setAttribute("class","list-group list-group-flush");
            col.firstChild.appendChild(list);

            for (let i = 0;i < json[1].data.children.length;i++) {
                // For each comment
                // Fetch comment data
                // Create and append comment with all replies
                let childdata = json[1].data.children[i].data;

                jsondata = await fetchComment(url,childdata.id);
                
                createComment(jsondata,url,true,list);
            }
        });
    }
}


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


function postContent(json,id,url) {
    var og = json[0].data.children[0].data;
    var post = "";

    if (!og.is_self) {
        // If it's not a self text post
        if (og.crosspost_parent_list) {
            cross = og.crosspost_parent_list[0];

            if (cross.is_video) {
                let video = cross.media.reddit_video.fallback_url;
                video = video.split("_")[0] + "_360.mp4"; //360p instead of 1080p
                post = "<video id='videoIN' width='50%' onplay='playSoundAndVideo();' onpause='playSoundAndVideo();' controls><source src='"+video+"'></source></video>";
                let audio = video.split("_")[0] + "_audio.mp4";
                post += "<audio id='audioIN'><source src='" + audio + "'></source></audio>";
            } else {
                if (cross.domain == "youtube.com" || cross.domain == "twitter.com") {
                    // If it's a youtube video or a tweet :
                    // Creation of the embedded content
                    post = parseMDtoHTML(cross.media.oembed.html);
                }   
                else {
                    if (cross.gallery_data) {
                        // If it's a gallery :
                        // Display each image of the gallery
                        var keys = cross.gallery_data.items;
                        for(let i=0; i < keys.length;i++) {
                            link = cross.media_metadata[keys[i].media_id].s.u;
                            link = link.replace(/&amp;/g,'&');
                            post += "<a target='_blank' href='"+link+"'><img class='post-image gallery' alt='"+link+"' src='"+ link +"'/></a>";
                        }
                    }   
                    else {
                        // It's an image
                        post = "<a target='_blank' href='"+cross.url+"'><img class='post-image' alt='"+cross.url+"' src='"+ cross.url +"'/></a>";
                    }
                }
            }

            if (cross.selftext_html) {
                post = parseMDtoHTML(cross.selftext_html);
            }

            post = "<div class='crosspost bg-dark'><div class='cross-header'>"+ cross.subreddit_name_prefixed +" : <a target='_blank' href='"+cross.url+"' class='link-to-reddit' >Link</a>"+ cross.title +"</div>"+ post + postInfo(cross,true,true) + "</div>";

        } else if (og.is_video) {
            // If it's a video
            // Creation of the video and audio content
            let video = og.media.reddit_video.fallback_url;
            video = video.split("_")[0] + "_360.mp4"; //360p instead of 1080p
            post = "<video id='videoIN' width='50%' onplay='playSoundAndVideo();' onpause='playSoundAndVideo();' controls><source src='"+video+"'></source></video>";
            let audio = video.split("_")[0] + "_audio.mp4";
            post += "<audio id='audioIN'><source src='" + audio + "'></source></audio>";
        } else {
            if (og.domain == "youtube.com" || og.domain == "twitter.com") {
                // If it's a youtube video or a tweet :
                // Creation of the embedded content
                post = parseMDtoHTML(og.media.oembed.html);
            }   
            else {
                if (og.gallery_data) {
                    // If it's a gallery :
                    // Display each image of the gallery
                    var keys = og.gallery_data.items;
                    for(let i=0; i < keys.length;i++) {
                        link = og.media_metadata[keys[i].media_id].s.u;
                        link = link.replace(/&amp;/g,'&');
                        post += "<a target='_blank' href='"+link+"'><img class='post-image gallery' alt='"+link+"' src='"+ link +"'/></a>";
                    }
                }   
                else {
                    // It's an image
                    post = "<a target='_blank' href='"+og.url+"'><img class='post-image' alt='"+og.url+"' src='"+ og.url +"'/></a>";
                }
            }
        }
    }
    else if (og.selftext_html) {
        // It's a selft text post
        post = parseMDtoHTML(og.selftext_html);
    }
                
    posttitle = "<div class='card-header'><a target='_blank' href='"+url+"' class='link-to-reddit' >Link</a>" +og.title +"</div>";

    buttons = "<div class='sorting post-sort'><span> Sort by : </span>";
    let sortingArray = ["confidence","top","new","controversial","old","qa"];
    for(i=0;i<sortingArray.length;i++) {
        buttons += "<button class='btn btn-dark sort' onclick='updateSortingComments(\""+ url + "\",\"" + id +"\",\""+ sortingArray[i] +"\");'>"+sortingArray[i] +"</button>";
    }
    buttons += "</div>";

    return "<div class='card bg-dark text-white rounded-0'>" + posttitle + "<div class='card-body'>"+ post + "</div>" + buttons + postInfo(og,true,true);
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