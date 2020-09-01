window.onload = function() 
{
    // Get list of menu nodes and add event handler to it.
    let list = document.getElementById("navList");
    let hiddenElemClass = "hiddenSection";

    list.addEventListener("click", function()
    {
        let selectedElemClass = "menu-list-element-selected";
        
        // If clicked element is not 'ul' and not selected element was clicked, select it.
        if(event.target.id != "navList" && !event.target.classList.contains(selectedElemClass))
        {
            // Get list of content blocks and list of menu elements.
            let content = document.getElementById("content").children;
            let listNodes = list.children;

            for(let i = 0; i < listNodes.length; i++)
            {
                if(listNodes[i].classList.contains(selectedElemClass))
                {
                    // Remove "selected" class from currently selected element.
                    listNodes[i].classList.remove(selectedElemClass);
                    // Add "hidden" class to content block that belongs to list element.
                    content[i].classList.add(hiddenElemClass);
                }

                // Remove "hidden" class from content block that belongs to "event.target" list element.
                listNodes[i] == event.target && content[i].classList.remove(hiddenElemClass);
            }
            
            // Add "selected" class to clicked element.
            event.target.classList.add(selectedElemClass);
        }
    });

    // ---------------- Handlers -------------------

    // Get the lifetime textbox node.
    let lifetimeText = document.getElementById("defaultLifetime");
    // The value of the textbox before changing.
    let lastValue = null;

    // Get a lifetime value from the storage and set it to the textbox.
    chrome.storage.sync.get("defaultLifetime", function(result) 
    {
        lifetimeText.value = result["defaultLifetime"];
    });

    // The handler that saves a data when the textbox loses focus.
    lifetimeText.addEventListener("focusout", function()
    {
        // RegEx that allows any number from 1 to 999.
        let threeDigNumRegExp = /^[1-9][0-9]{0,2}/g;
        let regResult = lifetimeText.value.match(threeDigNumRegExp);

        // Textbox value validation.
        if(regResult != null && regResult[0] != lastValue)
        {
            lifetimeText.value = regResult[0];
            chrome.storage.sync.set({"defaultLifetime": lifetimeText.value});
        }
        else
        {
            lifetimeText.value = lastValue;
        }
    })

    // The handler that saves the textbox data when it gets focus.
    lifetimeText.addEventListener("focusin", function()
    {
        lastValue = lifetimeText.value;
    });

    // Get popup hint and its button.
    let popup = document.getElementById("popup1");
    let hintButton = document.getElementById("popupButton1");

    // The handler to button that opens hint by click.
    hintButton.addEventListener("click", function() 
    {
        // If popup have "hidden" class - remove this class, otherwise add it.
        popup.classList.contains(hiddenElemClass) ? popup.classList.remove(hiddenElemClass) : popup.classList.add(hiddenElemClass);
    });

    // The handler that close popup when button lose focus.
    hintButton.addEventListener("focusout", function()
    {
        !popup.classList.contains(hiddenElemClass) && popup.classList.add(hiddenElemClass);
    });
}

/* ------------------- Functions ----------------------
-----------------------------------------------------*/
