function createCard(columnlist) {
    var row = document.getElementById("row");
    
    columns = columnlist.split(",");
    columns.forEach(element => {
        var col = document.createElement("div");
        col.setAttribute("class","col-3");
        col.setAttribute("data-spy","scroll");
        col.setAttribute("id",element);
        col.setAttribute("data-target","#"+element);
        col.setAttribute("data-offset","0");

        var card = document.createElement("div");
        card.setAttribute("class","card card-block text-white bg-dark mb-3 rounded-0");

        var cardheader = document.createElement("div");
        cardheader.setAttribute("class","card-header");
        cardheader.innerHTML = element;

        var cardbody = document.createElement("div");
        cardbody.setAttribute("class","card-body");
        
        card.appendChild(cardheader);
        fetchSubreddit(element,card);

        
        
        col.appendChild(card);
        row.appendChild(col);
    });
}

function fetchSubreddit(url,card) {

    var options = {methode:'GET',mode:'cors',cache:'default',headers:{"Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers:":"origin,x-requested-with,content-type,Authorization","Access-Control-Allow-Methods":"GET"}};
    if (url) {
        fetch('https://www.reddit.com/r/' + url + '.json?limit=100').then(function(response) {
            return response.json();
        }).then(function(json) {
            var links = '';
            for (var i = 0; i < json.data.children.length; i++) {
                link = "https://www.reddit.com" + json.data.children[i].data.permalink;
                links += "<li onclick='viewPost(\""+ json.data.children[i].data.permalink +"\",\""+ url +"\");' class='list-group-item bg-dark' id='"+ json.data.children[i].data.id +"'>";
                if (json.data.children[i].data.preview && json.data.children[i].data.selftext == "") {
                   links+= "<img class='post-thumb' src='" + json.data.children[i].data.thumbnail + "'>";
                } else {
                    links +="<div class='thumb-self'></div>";
                }
                links += "<p href='https://www.reddit.com/" + json.data.children[i].data.permalink + "'>" + json.data.children[i].data.title + "</p></li>";
                links += postInfo(json.data.children[i].data);
            }
            sub = document.createElement("ul");
            sub.setAttribute("class","list-group list-group-flush");
            sub.innerHTML = links;
            card.appendChild(sub);
            
        });
    }
}

function parseMDtoHTML(md) {
    var parser = new DOMParser;
    var dom = parser.parseFromString(md,"text/html");
    return dom.body.textContent
}

function fetchPosts(url,col,id) {
    if (url) {
        fetch(url + '.json?limit=5000').then(function(response) {
            return response.json();
        }).then(function(json) {
            og = json[0].data.children[0].data;
            if (!og.is_self) {
                if (og.is_video) {
                    var post = "<video width='50%' controls><source src='"+og.media.reddit_video.fallback_url+"'></source></video>";
                } else {
                    if (og.domain == "youtube.com" || og.domain == "twitter.com") {
                        var post = parseMDtoHTML(og.media.oembed.html);
                    }
                    else {
                        post = "<a target='_blank' href='"+og.url+"'><img class='post-image' alt='"+og.url+"' src='"+ og.url +"'/></a>";
                    }
                }
            }
            else {
                var post = parseMDtoHTML(og.selftext_html);
            }
            
            posttitle = "<div class='card-header'><button type='button' class='btn btn-dark' onclick='hidePost(\""+ id +"\");'> X </button><a target='_blank' href='"+url+"' class='link-to-reddit' >Reddit</a>" +json[0].data.children[0].data.title +"</div>";

            content = '';
            for (let i = 0;i < json[1].data.children.length-1;i++) {
                content +=  "<li class='list-group-item bg-dark'>"+ postInfo(json[1].data.children[i].data) +"<p>"+parseMDtoHTML(json[1].data.children[i].data.body_html);
                if (json[1].data.children[i].data.replies) {
                    content += fetchComments(json[1].data.children[i].data.replies.data.children,true);
                }
                content+= "</p></li>";
            }

            content = "<ul class='list-group list-group-flush'>" + content + "</ul>";
            col.innerHTML = "<div class='card bg-dark text-white rounded-0'>" + posttitle + "<div class='card-body'>"+ post + "</div>" + postInfo(json[0].data.children[0].data)  + content +  "</div>";
        });
    }
}

function postInfo(data) {
    info = "<p class='post-info'>"+ data.ups + " 🡅  - " + data.author;
    if (data.num_comments) {
        info+=" - " +data.num_comments+" comments </p>";
    }
    return info;
}

function fetchComments(json,nest) {
    if (json.length > 0) {
        var comment = "";
        if (nest) {
            comment += "<li class='list-group-item bg-dark nested'>"
        } else {
            comment += "<li class='list-group-item bg-dark'>"
        }

        
        for (let i =0;i < json.length;i++) {
            comment+=postInfo(json[i].data) +"<p>";
        let nested = !nest;
            comment += parseMDtoHTML(json[i].data.body_html);
            if (json[i].data.replies) {
                comment += fetchComments(json[i].data.replies.data.children,nested);
            }
        }
        comment += "</p></li>";
        comment = "<ul class='list-group list-group-flush'>" + comment + "</ul>";
        return comment;
    } else {
        return "";
    }
}

function viewPost(url,id) {
    hideSubs(id);
    var row = document.getElementById("row");
    if (document.getElementById("post-content")) {
        row.removeChild(document.getElementById("post-content"));
    }
    var col = document.createElement("div");
    col.setAttribute("class","col-9");
    col.setAttribute("id","post-content");
    row.appendChild(col);
    posturl = "https://www.reddit.com"+url;
    fetchPosts(posturl,col,id);
}

function hidePost(id) {
    var row = document.getElementById("row");
    row.removeChild(document.getElementById("post-content"));
    showSubs(id);
}

function hideSubs(id) {
    var row = document.getElementById("row");
    for (i=1;i<row.childElementCount;i++) {
        if (row.children[i].id != id) {
            row.children[i].style.display = "none";
        }
        
    }
}

function showSubs(id) {
    var row = document.getElementById("row");
    for (i=1;i<row.childElementCount;i++) {
        row.children[i].style = null;
    }

    document.getElementById(id).scrollIntoView({behavior:"smooth",block:"start",inline:"center"});
}

function refresh() {
    document.location.reload();
}

function manageList() {
    var value = document.getElementById("sublist").value;
    if (value && value != getCookie("columns")) {
        setCookie("columns",value,365);
        refresh();
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }