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

    recreateTooltips();
}

function recreateTooltips() {
    $('[data-toggle="tooltip"]').tooltip('dispose').tooltip({boundary: 'window'});
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

    createNavbarButton(element);

    return card;
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

function fetchAbout(url) {
  // Get subreddit about info
  // url : name of the subreddit

  if (url) {
     fetch('https://www.reddit.com/r/' + url + '/about.json').then(function(response) {
         return response.json();
     }).then(function(json) {
        let buttonScroll = document.getElementById('scroll-'+url);
        let icon = document.createElement('img');

        if (json.data.icon_img !== ''){
          icon.setAttribute('src',json.data.icon_img);
        } else if (json.data.community_icon !== '') {
          let iconSrc = json.data.community_icon.split('?')[0];
          icon.setAttribute('src', iconSrc);
        } else {
          buttonScroll.innerHTML = 'r/'+url[0].toUpperCase();
        }

        buttonScroll.appendChild(icon);
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

function createNavbarButton(id) {
  //Create a button in the navbar to scroll to the subreddit
  let navbar = document.getElementById('navbar');

  let liScroll = document.createElement('li');
  liScroll.setAttribute('data-toggle','tooltip');
  liScroll.setAttribute('data-placement','right');
  liScroll.setAttribute('title',id);

  let buttonScroll = document.createElement('button');
  buttonScroll.setAttribute('id','scroll-'+id);
  buttonScroll.setAttribute('class','btn btn-dark');
  buttonScroll.addEventListener("click",function() {
      scrollToSub(id);
  });

  liScroll.appendChild(buttonScroll);
  navbar.appendChild(liScroll);

  fetchAbout(id);
}

function parseMDtoHTML(md) {
    // Transform md content into html

    let parser = new DOMParser;
    let dom = parser.parseFromString(md,"text/html");
    let text = dom.body.textContent;
    let texts = text.split(' ');

    for(let i=0; i < texts.length; i++) {
      if (texts[i].includes('href="/r/')) {
        regex = RegExp('href="/r/','g');
        let replaced = texts[i].replace(regex,'href="https://www.reddit.com/r/');
        texts[i] = replaced;
      }
      if (texts[i].includes('href="/u/')) {
        regex = RegExp('href="/u/','g');
        let replaced = texts[i].replace(regex,'href="https://www.reddit.com/u/');
        texts[i] = replaced;
      }
    }

    return texts.join(' ');
}
