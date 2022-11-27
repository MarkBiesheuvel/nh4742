class Design {
  constructor(button, svgDoc) {
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
let activeDesign = null;
let activeFloorButton = null;
svg.addEventListener('load', () => {

  // Get inner document from SVG
  const svgDoc = svg.contentDocument;

  // Iterate over all buttons that target design
  const buttons = document.querySelectorAll('button[data-target="design"]');
  const designs = Array.from(buttons).map((button) => {
    return new Design(button, svgDoc);
  });

  // Activate first design
  designs[0].activate();

  // Iterate over all buttons that target floor
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

  // Iterate over all paths inside designs
  const createText = (length, x, y, rotate=false) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.classList.add('small');
    text.textContent = `${Math.abs(length/100).toFixed(2)}m`;
    text.setAttribute('filter', 'url(#solid-bg)')
    if (rotate) {
      text.setAttribute('transform', `translate(${x},${y}) rotate(90)`);
    } else {
      text.setAttribute('transform', `translate(${x},${y})`);
    }
    return text;
  }
  svgDoc.querySelectorAll('g[data-role="design"] path').forEach((path) => {
    const parent = path.parentNode;
    const d = path.getAttribute('d');
    const segments = d.split(/(?=[vhZ])/);
    let originX = x = 0;
    let originY = y = 0;
    let matches;
    segments.forEach((segment) => {
      // M for move
      matches = segment.match(/M\s+(\d+)\s+(\d+)/);
      if (matches) {
        originX = x = parseInt(matches[1]);
        originY = y = parseInt(matches[2]);
      }

      // h for horizontal line
      matches = segment.match(/h\s+(-?\d+)/);
      if (matches) {
        const width = parseInt(matches[1]);

        // Add text element in the middle of the line
        const text = createText(width, x + width / 2, y, false);
        parent.appendChild(text);

        // Update coordinates
        x += width;
      }

      // v for vertical line
      matches = segment.match(/v\s+(-?\d+)/);
      if (matches) {
        const height = parseInt(matches[1]);

        // Add text element in the middle of the line
        const text = createText(height, x, y + height / 2, true);
        parent.appendChild(text);

        // Update coordinates
        y += height;
      }

      // Z is back to home
      if (segment.match(/Z/)) {
        const dx = originX - x;
        const dy = originY - y;
        if (Math.abs(dy) < Math.abs(dx)) { // Horizontal line
          const text = createText(dx, x + dx / 2, y, false);
          parent.appendChild(text);
        } else { // Vertical line
          const text = createText(dy, x, y + dy / 2, true);
          parent.appendChild(text);
        }
      }
    });
  });
});