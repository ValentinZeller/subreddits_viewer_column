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
                col.innerHTML = createPost(json,id,url);
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


function createPost(json,id,url) {
    var og = json[0].data.children[0].data;
    var post = "";

    if (!og.is_self) {
        // If it's not a self text post
        if (og.crosspost_parent_list) {
            cross = og.crosspost_parent_list[0];
            post = postContent(cross,true);

        } else {
            post = postContent(og,false);
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

function postContent(og,isCrosspost) {
    post = "";
    if (og.is_video) {
        // If it's a video
        // Creation of the video and audio content
        let video = og.media.reddit_video.fallback_url;
        video = video.split("_")[0] + "_360.mp4"; //360p instead of 1080p
        post = "<video id='videoIN' width='50%' onclick='playVideoAndSound();' ><source src='"+video+"'></source></video>";
        let audio = video.split("_")[0] + "_audio.mp4";
        post += "<br><audio id='audioIN' onplay='playSoundAndVideo();' onpause='playSoundAndVideo();' onseeking='playSoundAndVideo();' controls><source src='" + audio + "'></source></audio>";
    } else if (og.selftext_html != null) {
        post = parseMDtoHTML(og.selftext_html);
    }else {
        if (og.domain == "youtube.com" || og.domain == "twitter.com") {
            // If it's a youtube video or a tweet :
            // Creation of the embedded content
            post = parseMDtoHTML(og.media.oembed.html);
        }   
        else {
            if (og.is_gallery) {
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

    if (isCrosspost) {
        post = "<div class='crosspost bg-dark'><div class='cross-header'>"+ og.subreddit_name_prefixed +" : <a target='_blank' href='"+og.url+"' class='link-to-reddit' >Link</a>"+ og.title +"</div>"+ post + postInfo(og,true,true) + "</div>";
    }
    return post;
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

function updateSorting(url,sort,time) {
    // Change the displayed posts corresponding to the sorting
    // url : name of the subreddit
    // sort : sorting method (new,hot,rising,top)
    // time : for the top sorting (hour,day,week,month,year,all)

    card = document.getElementById(url).firstElementChild;
    card.removeChild(card.children[1]);
    fetchSubreddit(url,card,sort,time);
}