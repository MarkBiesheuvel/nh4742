class Design {
  constructor(button) {
    this.button = button;
    this.id = button.dataset.id;
    this.group = svgDoc.querySelector(`g[data-id="design-${this.id}"]`);
    this.activateFloor = null;

    const floors = this.group.querySelectorAll('g[data-role="floor"]');
    this.floors = Array.from(floors).map((g) => {
      return new Floor(g);
    });

    // Preselect the first floor in the list (which is ground floor)
    if (this.floors.length > 0) {
      this.activateFloor = this.floors[0];
    }

    button.addEventListener('click', () => {
      if (activeDesign) {
        activeDesign.deactivate();
      }
      this.activate();
    });
  }

  setFloor(index) {
    // Deactivate previous floor
    if (this.activateFloor) {
      this.activateFloor.deactivate();
    }
    // Activate new floor
    if (0 <= index && index < this.floors.length) {
      this.activateFloor = this.floors[index];
      this.activateFloor.activate();
    }
  }

  activate() {
    // Update styling of button
    this.button.classList.add('active');
    
    // Show SVG group of this design
    this.group.setAttribute('visibility', 'visible');

    // If this design has floors, activate the active floor again
    if (this.activateFloor) {
      this.activateFloor.activate();
    }
    
    // Set global reference, so this design can be deactivated later
    activeDesign = this;
  }

  deactivate() {
    // Update styling of button
    this.button.classList.remove('active')

    // Hide SVG group of this design
    this.group.setAttribute('visibility', 'hidden');

    // If this design has floors, deactivate the active floor
    if (this.activateFloor) {
      this.activateFloor.deactivate();
    }
  }
}

class Floor {
  constructor(group) {
    this.group = group;
  }

  activate() {
    this.group.setAttribute('visibility', 'visible');
  }

  deactivate() {
    this.group.setAttribute('visibility', 'hidden');
  }
}

// Wait for the SVG to be loaded before enabling interaction
const svg = document.getElementById('svg');
let svgDoc;
let activeDesign = null;
let activeFloorButton = null;
svg.addEventListener('load', () => {

  // Get inner document from SVG
  svgDoc = svg.contentDocument;

  // Iterate over all buttons
  const buttons = document.querySelectorAll('button[data-target="design"]');
  const designs = Array.from(buttons).map((button) => {
    return new Design(button);
  });

  // Activate first design
  designs[0].activate();

  document.querySelectorAll('button[data-target="floor"]').forEach((button, index) => {
    // First one is already active
    if (index == 0) {
      activeFloorButton = button;
    }

    button.addEventListener('click', () => {
      if (activeDesign) {
        // Deactivate previous floor button
        if (activeFloorButton) {
          activeFloorButton.classList.remove('active')
        }

        // Update the floor of the active design
        activeDesign.setFloor(index);

        // Set the current active
        button.classList.add('active')
        activeFloorButton = button;
      }
    })
  });
});