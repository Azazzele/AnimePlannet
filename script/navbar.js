document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdown_menubar');
    const dropdownMenu = document.getElementById('dropdown-menu');

    // Toggle dropdown menu visibility
    function toggleDropdownMenu(event) {
        const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';

        // Update aria-expanded and toggle visibility using CSS class
        dropdownButton.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle the CSS class for visibility
        dropdownMenu.classList.toggle('visible', !isExpanded);

        // Prevent the click event from propagating to document click listener
        event.stopPropagation();
    }

    // Close the menu if clicked outside
    document.addEventListener('click', function(event) {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.classList.remove('visible');
        }
    });

    // Close the menu when the page is scrolled
    window.addEventListener('scroll', function() {
        if (dropdownMenu.classList.contains('visible')) {
            dropdownButton.setAttribute('aria-expanded', 'false');
            dropdownMenu.classList.remove('visible');
        }
    });

    // Add event listener to the dropdown button
    dropdownButton.addEventListener('click', toggleDropdownMenu);
});
