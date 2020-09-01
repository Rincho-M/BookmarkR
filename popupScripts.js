// When the user opens the popup.
window.onload = function() 
{
    // Get data from storage.
    chrome.storage.sync.get(null, function(result) 
    {
        let outdatedIndexes = [];
        let allIds = [];

        // Get the keys.
        let allKeys = Object.keys(result);
        for (let i = 0, j = 0; i < allKeys.length - 3; i++)
        {
            // Check if a bookmark is outdated and store it id`s index in array.
            if(Date.now() >= result[allKeys[i]][1])
            {
                outdatedIndexes[j] = i;
                j++;
            }
            // Get bookmarks IDs by keys and convert them to strings.
            allIds[i] = result[allKeys[i]][0].toString();
        }

        // Get the user`s score.
        let scoreArr = result[allKeys[allKeys.length - 1]];

        // Check the array for bookmark`s IDs.
        if(allIds.length > 0)
        {
            // Get bookmarks using their IDs.
            chrome.bookmarks.get(allIds, function(results)
            {
                // Update html bookmark list.
                UpdateList(results, outdatedIndexes);
                
                // If there are outdated bookmarks, remove their data and update losses counter.
                if(outdatedIndexes.length)
                {
                    RemoveBookmarksData(allIds, outdatedIndexes);
                    UpdateLosses(scoreArr, outdatedIndexes);

                    let count = result[allKeys[allKeys.length - 2]];
                    UpdateCounter(count, outdatedIndexes);
                }
            });
        }

        // Update productivity text.
        ProductivityUpdate(scoreArr);
    });

    // ---------------- Handlers -------------------

    // Add handler to button that opens options page.
    document.getElementById("optionsButton").addEventListener("click", function()
    {
        chrome.runtime.openOptionsPage();
    });
}

/* ------------------- Functions ----------------------
-----------------------------------------------------*/

// Calculate percentage of productivity based on the number of bookmarks deleted in time.
// Also call function to output data.
function ProductivityUpdate(scoreArr)
{
    let productivity;
    
    // Handle "divide by zero" exception.
    if(scoreArr[0] == 0 && scoreArr[1] == 0) 
    {
        productivity = 0;
    }
    else
    {
        productivity = scoreArr[0] / (scoreArr[0] + scoreArr[1]) * 100;
        productivity = Math.round(productivity);
    }

    ProductivityOutput(productivity);
}

// Get html nodes and add data to them.
function ProductivityOutput(productivity)
{
    let prodDiv = document.getElementById("prodDiv");
    let prodString = `Productivity: ${productivity}%`;

    prodDiv.childNodes[1].innerHTML = prodString;
    prodDiv.childNodes[3].innerHTML = prodString;
}

// Update the list of bookmarks. 
function UpdateList(bookmarks, indexes)
{
    // Get bookmark list from html page.
    let bookmarksList = document.getElementById("bookmarkList");

    // Check and output temporary bookmarks.
    for (let i = 0, j = 0; i < bookmarks.length; i++)
    {
        // Check if current bookmark is outdated.
        if(j < indexes.length && indexes[j] == i)
        {
            // Add crossed out title of outdated bookmark in the list.
            let node = CreateNode(bookmarks[i]);
            bookmarksList.appendChild(node);
            node.style.textDecoration = "line-through";
            
            // Increase count of outdated bookmarks array indexes.
            j++;
        }
        else
        {
            // Add a bookmark title in the list.
            let node = CreateNode(bookmarks[i]);
            bookmarksList.appendChild(node);
        }
    }
}

// Create list node and fill it with bookmark title.
function CreateNode(bookmark)
{
    let textNode = document.createTextNode(bookmark.title);
    let listNode = document.createElement("li");

    listNode.appendChild(textNode);

    return listNode;
}

// Remove bookmarks data by selected indexes in IDs array.
function RemoveBookmarksData(idsArr, idxToDelete)
{
    for (let i = 0; i < idxToDelete.length; i++)
    {
        let keyId = 'data' + idsArr[idxToDelete[i]];
        chrome.storage.sync.remove(keyId, function() 
        {
            console.log("Data successfully removed!");
        });
    }
}

// Update number of loses.
function UpdateLosses(scoreArr, outdatedIndexes)
{
    scoreArr[1] += outdatedIndexes.length;
    chrome.storage.sync.set({"zScore": scoreArr}, function()
    {
        console.log("The score updated. More loss(es) :(")
    });
}

// Update counter of current temporary bookmarks.
function UpdateCounter(numOfBms, outdatedIndexes)
{
    numOfBms -= outdatedIndexes.length;
    chrome.storage.sync.set({"zBmCounter": numOfBms}, function()
    {
        console.log("Counter successfully updated!");
    });
}