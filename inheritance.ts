/// <reference path="typings/browser.d.ts" />
let derbyWidth = 800;
let derbyHeight = 600;
let vehicles: Array<Vehicle> = [];
let sirensBlinking = false;

interface IVehicle {
    damagePoints: number;
    damageTolerance: number;
    speed: number;
    vehicleElement: HTMLDivElement;
    className: string;
}

class Vehicle implements IVehicle {
    damagePoints: number = 0;
    damageTolerance: number;
    speed: number;
    vehicleElement: HTMLDivElement;
    className: string;
    
    constructor(damageTolerance: number, speed: number) {
        this.damageTolerance = damageTolerance;
        this.speed = speed;
    }
    
    moveRight(): void {
        $(this.vehicleElement).animate({
            left: derbyWidth
        }, {
            duration: this.speed,
            queue: false,
            complete: () => {
                $(this.vehicleElement).css({left: -50});
                this.moveRight();
            }
        });
    }
    
    moveLeft(): void {
        $(this.vehicleElement).animate({
            left: -50
        }, {
            duration: this.speed,
            queue: false,
            complete: () => {
                $(this.vehicleElement).css({left: derbyWidth});
                this.moveLeft();
            }
        });
    }
    
    moveUp(): void {
        $(this.vehicleElement).animate({
            top: -50
        }, {
            duration: this.speed,
            queue: false,
            complete: () => {
                $(this.vehicleElement).css({top: derbyHeight});
                this.moveUp();
            }
        });
    }
    
    moveDown(): void {
        $(this.vehicleElement).animate({
            top: derbyHeight
        }, {
            duration: this.speed,
            queue: false,
            complete: () => {
                $(this.vehicleElement).css({top: 0});
                this.moveDown();
            }
        });
    }
    
    move(): void {
        this.moveRight();
    }
    
    damage(): void {
        this.damagePoints++;
        if (this.damagePoints >= this.damageTolerance) {
            this.remove();
        }
    }
    
    remove(): void {
        document.getElementById('crash_derby').removeChild(this.vehicleElement);
        let target = vehicles.indexOf(this);
        if (target !== -1) {
            vehicles.splice(target, 1);
        }
    }
    
    add(): void {
        this.vehicleElement = document.createElement('div');
        this.vehicleElement.style.top = String(Math.floor(Math.random() * derbyHeight));
        this.vehicleElement.style.left = String(Math.floor(Math.random() * derbyWidth));
        this.vehicleElement.classList.add('vehicle', this.className);
        document.getElementById('crash_derby').appendChild(this.vehicleElement);
    }
    
    hasCollidedWith(anotherVehicle: Vehicle): boolean {
        var $thisDiv = $(this.vehicleElement);
        var $anotherDiv = $(anotherVehicle.vehicleElement);
        var thisTop = $thisDiv.position().top;
        var thisLeft = $thisDiv.position().left;
        var anotherTop = $anotherDiv.position().top;
        var anotherLeft = $anotherDiv.position().left;
        
        // IF this vehicle is not in the exact position as another vehicle (which means most likely itself)
        // AND it is NOT the case that one of the tell-tale signs of non-intersection is true
        if (
                (thisTop !== anotherTop && thisLeft !== anotherLeft) &&
                !(
                    ((thisTop + $thisDiv.height()) < anotherTop) ||
                    (thisTop > (anotherTop + $anotherDiv.height())) ||
                    ((thisLeft + $thisDiv.width()) < anotherLeft) ||
                    (thisLeft > (anotherLeft + $anotherDiv.width()))
                )
            )
            {
                return true;
            } else {
                return false;
            }
    }
}

class Car extends Vehicle {
    isInReverse: boolean;
    
    constructor() {
        // Call the constructor for the superclass Vehicle
        // Creates a new base Vehicle with a damage tolerance of 2 and a speed of 5000
        super(2, 5000);
        this.className = 'car';
        this.isInReverse = false;
    }
    
    move(): void {
        this.moveRight();
    }
    
    reverse(): void {
        $(this.vehicleElement).stop();
        if (this.isInReverse) {
            this.move();
        } else {
            this.moveLeft();
        }
        this.isInReverse = !this.isInReverse;
    }
}

class CopCar extends Car {
    
    constructor() {
        // Call the superclass Car (which calls its superclass Vehicle)
        // Override the default Car values to damage tolerance 3 and className=cop
        super();
        this.damageTolerance = 3;
        this.className = 'cop';
    }
    
    move(): void {
        this.moveDown();
    }
    
    reverse(): void {
        $(this.vehicleElement).stop();
        if (this.isInReverse) {
            this.move();
        } else {
            this.moveUp();
        }
        this.isInReverse = !this.isInReverse;
    }
    
    startSiren(): void {
        this.vehicleElement.classList.add('blinking');
    }
    
    stopSiren(): void {
        this.vehicleElement.classList.remove('blinking');
    }
}

class Motorcycle extends Vehicle {
    
    constructor() {
        // Call superclass Vehicle
        // Sets damage tolerance to 1, speed of 2500
        super(1, 2500);
        this.className = 'motorcycle';
    }
    
    move(): void {
        this.moveRight();
        this.moveDown();
    }
}

class Tank extends Vehicle {
    
    constructor() {
        // Call superclass Vehicle
        // Sets damage tolerance to 10, speed of 10,000
        super(10, 10000);
        this.className = 'tank';
    }
    
    move(): void {
        this.moveUp();
        this.moveLeft();
    }
}

function createButtonClicked(type: string) {
    let vehicle: Vehicle;
    switch (type) {
        case 'car':
            vehicle = new Car();
            break;
        case 'cop':
            vehicle = new CopCar();
            break;
        case 'moto':
            vehicle = new Motorcycle();
            break;
        case 'tank':
            vehicle = new Tank();
            break;
    }
    vehicle.add();
    vehicle.move();
    if (sirensBlinking && vehicle instanceof CopCar) {
        vehicle.vehicleElement.classList.add('blinking');
    }
    vehicles.push(vehicle);
}

function shiftGears() {
    for (let l = 0; l < vehicles.length; l++) {
        let vehicle = vehicles[l];
        if (vehicle instanceof Car) {
            vehicle.reverse();
        }
    }
}

function toggleSirens() {
    for (let i = 0; i < vehicles.length; i++) {
        let vehicle = vehicles[i];
        if (vehicle instanceof CopCar) {
            if (sirensBlinking) {
                vehicle.stopSiren();
            } else {
                vehicle.startSiren();
            }
        }
    }
    sirensBlinking = !sirensBlinking;
}

function checkCollisions() {
    for (let k = 0; k < vehicles.length; k++) {
        let vehicle = vehicles[k];
        // Check if this current vehicle has collided with any other vehicle in the game
        for (let m = 0; m < vehicles.length; m++) {
            let anotherVehicle = vehicles[m];
            if (vehicle.hasCollidedWith(anotherVehicle)) {
                vehicle.damage();
                anotherVehicle.damage();
            }
        }
    }
}

setInterval(checkCollisions, 750);