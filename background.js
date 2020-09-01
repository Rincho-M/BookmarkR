// Global variable of the current number of temp bookmarks.
var numOfBookmarks;
// Get value of bookmarks counter on startup.
chrome.storage.sync.get("zBmCounter", function(result)
{
    numOfBookmarks = result["zBmCounter"];
});
/*chrome.storage.sync.get(null, function(result)
{
    console.log(result);
});*/

// Create score data and bookmark counter when the extension installed.
chrome.runtime.onInstalled.addListener(function(details)
{
    if(details.reason == "install")
    {
        chrome.storage.sync.set({ "zScore": [0, 0] });
        chrome.storage.sync.set({ "zBmCounter": 0 });
        chrome.storage.sync.set({ "defaultLifetime": 7 });
    }
});

// Add new handler to OnCreated event.
chrome.bookmarks.onCreated.addListener(function(id, bookmark) 
{
    /* Here we updating bookmarks title, because we want to trigger OnChanged event, 
    when the user clicks on "Done" button in "Edit bookmark" window.
    After we update title here in code, title in "Edit bookmark" window doesn`t update and will be same,
    like the page name. So when the user clicks on "Done" button, the event will be triggered.
    We want our window to appear only when the user completes his bookmark creation,
    in other words when he clicks on "Done" button.*/
    chrome.bookmarks.update(id, { title: "-------" }, function() 
    {
        /* Add a new handler to OnChanged event, ONLY after updating the bookmark title to avoid triggering the handler.
        We want it be triggered only when the user change the bookmark, not us. */
        chrome.bookmarks.onChanged.addListener(function ProcessBookmarkData(id, changedInfo)
        {
            // Check if the limit of temporary bookmarks has been reached.
            if(numOfBookmarks < 8)
            {
                // Get value of default bookmark lifetime from options page.
                chrome.storage.sync.get("defaultLifetime", function(result)
                {
                    // Save data if bookmark is temporary.
                    SaveData(GetLifetime(result["defaultLifetime"]), id, numOfBookmarks);
                    numOfBookmarks++;
                });
            }
            else
            {
                alert("The maximum number of temporary bookmarks is 8!");
            }

            // Remove handler.
            chrome.bookmarks.onChanged.removeListener(ProcessBookmarkData);
        });
    });
});

// When the user delete the bookmark.
chrome.bookmarks.onRemoved.addListener(function(id, removeInfo) 
{
    // Check if deleted bookmark was temporary.
    let keysArr = ["zScore", "data" + id];
    chrome.storage.sync.get(keysArr, function(bookmarkData)
    {
        if(bookmarkData.hasOwnProperty(keysArr[1]))
        {
            // Remove bookmark data by key.
            chrome.storage.sync.remove(keysArr[1]);
    
            // Update value of bookmark counter.
            numOfBookmarks--;
            chrome.storage.sync.set({ "zBmCounter": numOfBookmarks });

            // Check if a bookmark is outdated and update the score.
            let scoreArr = bookmarkData["zScore"];
            (Date.now() < bookmarkData[keysArr[1]][1]) ? scoreArr[0]++ : scoreArr[1]++;
            chrome.storage.sync.set({ "zScore": scoreArr });
        }
    });
});

// Handler which update numOfBookmarks value if bookmarks data deleting from popupScripts.
chrome.storage.onChanged.addListener(function(changes, areaName)
{
    if(Object.keys(changes)[0].localeCompare("zBmCounter") == 0)
    {
        numOfBookmarks = changes["zBmCounter"]["newValue"];
    }
});

/* ------------------- Functions ----------------------
-----------------------------------------------------*/

// Checks if a value is valid. Works only if the value was cast to Number.
function IsValid(value) 
{
    if(isNaN(value) || value == 0)
    {
        alert("Error! Invalid value.")
        return false;
    }
    return true;
}

// Get timestamp of bookmark`s deletion date.
function GetDeletionDate(days)
{
    let date = new Date().getTime();
    let daysInMs = new Date(days * 24 * 3600 * 1000).getTime();
    date = date + daysInMs;

    return date;
}

// Save data of the bookmark.
function SaveData(lifetime, id, numOfBms)
{
    if(lifetime != 0)
    {
        let keyId = "data" + id; 
        let bookmarkData = [id, lifetime]
        chrome.storage.sync.set({ [keyId]: bookmarkData });

        // Increase counter of bookmarks and save it.
        numOfBms++;
        chrome.storage.sync.set({ "zBmCounter": numOfBms });
    }
}

// Get data from user about temporality of the bookmark and save it.
function GetLifetime(defaultLifetime)
{
    let isValid;
    let lifetime;

    // Validation of bookmark temporality value.
    do
    {
        // Create window to ask user to enter bookmark lifetime.
        lifetime = window.prompt("If you want to make this bookmark temporary, please enter it`s lifetime in days below.", defaultLifetime);
        isValid = false;

        if(lifetime == null)
        {
            break;
        }
        else
        {
            lifetime = Number(lifetime);
            isValid = IsValid(lifetime);
        }
    } 
    while (!isValid);

    // If the bookmark is temporary and its time value is valid, return its lifetime.
    if(isValid)
    {
        // Convert date in days to a timestamp.
        return GetDeletionDate(lifetime);
    }
    else
    {
        return 0;
    }
}