const classes = {
    container: 'container',
    navigation: 'nav',
    mapId: 'map',
    classMap: 'map',
    enterRoute: 'enterRoute',
    routes: 'routes',
    route: 'route',
    activeUp: 'route--active-up',
    activeDown: 'route--active-down'
}

class Routes {
    constructor(element, option = {}) {

        this.container = element

        // Array with routes
        this.routesArray = ['Пушкино', 'Москва', 'Подольск']

        this.dragCurrentRoute = null;
        this.dropCurrentRoute = null;

        // Bind functions
        this.manageHTML = this.manageHTML.bind(this)
        this.mapRender = this.mapRender.bind(this)
        this.setEvents = this.setEvents.bind(this)
        this.addRoute = this.addRoute.bind(this)
        this.setParameters = this.setParameters.bind(this)
        this.changeRoutes = this.changeRoutes.bind(this)
        this.startDrag = this.startDrag.bind(this)
        this.stopDrag = this.stopDrag.bind(this)
        this.dragEnter = this.dragEnter.bind(this)
        this.dragLeave = this.dragLeave.bind(this)
        this.setStylePosition = this.setStylePosition.bind(this)
        this.dragMoving = this.dragMoving.bind(this)

        // Run functions
        this.manageHTML()
        this.setEvents()
        this.setParameters()
    }

    manageHTML() {
        this.container.innerHTML = 
            `
                <div class=${classes.container}>
                    <div class=${classes.navigation}>
                        <input type="text" class=${classes.enterRoute}>
                        <div class=${classes.routes}>
                        </div>
                    </div>
                    <div class=${classes.classMap}>
                        <div id=${classes.mapId}></div>
                    </div>
                </div>
            `;
        this.mapRender()

        // Map ID node
        this.mapIdNode = document.getElementById(classes.mapId);
        // Input route node
        this.enterRouteNode = document.querySelector(`.${classes.enterRoute}`);
        // Routes node
        this.routesNode = document.querySelector(`.${classes.routes}`)

        // help
        if (this.routesArray.length != 0) {
            this.routesArray.map((name) => {
                this.routesNode.insertAdjacentHTML('beforeend', routeMarkup(name))
            })
        }
    }

    setParameters() {
        // Начало движения для tranform translateY
        this.y = 0;
        // this.routeNode = Array.from(this.routesNode.children);
    }

    setEvents() {
        // Get input value of route
        this.enterRouteNode.addEventListener('change', this.addRoute)

        this.routeNode = Array.from(this.routesNode.children)
        this.routeNode.map((route, index) => {
            this.startIndex = index
            route.addEventListener('pointerdown', this.startDrag)
        })
        window.addEventListener('pointerup', this.stopDrag)

    }

    // Render of the map on the page
    mapRender = () => {
        ymaps.ready(() => {
    
            let myMap = new ymaps.Map(classes.mapId, {
                center: [55.76, 37.57],
                zoom: 9,
                controls: []
            })
    
            let multiRoute = new ymaps.multiRouter.MultiRoute(
                {
                    referencePoints: this.routesArray
                },
                {
                    boundsAutoApply: true
                }
            )
    
            myMap.geoObjects.add(multiRoute)
        })
    }
    
    // Add route form input
    addRoute() {
        this.routesArray.push(event.target.value)
        this.routesNode.insertAdjacentHTML('beforeend', routeMarkup(event.target.value))
        event.target.value = ''
        this.changeRoutes()
        console.log(this.routesArray)
    }

    changeRoutes() {
        if (this.routesArray.length > 1) {
            this.mapIdNode.innerHTML = '';
            this.mapRender()
        }
    }

    startDrag() {
        this.dragCurrentRoute = {route: event.target, index: this.routeNode.indexOf(event.target)}

        this.startClick = event.pageY
        console.log('Start drag --> ', this.dragCurrentRoute);
        this.routeNode.map((item) => {
            console.log()
            if (event.target !== item) {
                item.addEventListener('pointerenter', this.dragEnter)
                item.addEventListener('pointerleave', this.dragLeave)
            }
            window.addEventListener('pointermove', this.dragMoving)
        })
    }
    stopDrag() {
        
        if (event.target.parentNode === this.routesNode) {
            console.log('Stop drag --> ', this.dropCurrentRoute)
        }
        Array.from(this.routesNode.children).map((item) => {
            item.removeEventListener('pointerenter', this.dragEnter)
            item.removeEventListener('pointerleave', this.dragLeave)
        })
        event.target.classList.remove(classes.activeUp)
        window.removeEventListener('pointermove', this.dragMoving)
        this.setStylePosition(0)
    }
    dragEnter() {
        this.dropCurrentRoute = {route: event.target, index: this.routeNode.indexOf(event.target)}
        console.log('DragEnter -->', this.dropCurrentRoute)

        event.target.classList.add(classes.activeUp)
    }
    dragLeave() {
        event.target.classList.remove(classes.activeUp)
        // console.log('dragLeave --> ', event.target)
    }
    dragMoving() {
        this.move = event.pageY
        this.shift = this.move - this.startClick
        console.log(this.move)
        this.setStylePosition(this.shift)
    }
    setStylePosition(shift) {
        console.log(this.dragCurrentRoute.route)
        this.dragCurrentRoute.route.style.transform = `translateY(${shift}px)`
    }
}

// ----------- Helpers
const routeMarkup = (name) => {
    return `
        <div class="route">
        <span>${name}</span>
        <button>Close</button>
        </div>
    `
}


// const mapId = document.getElementById(classes.mapId);
// // console.info(mapId)
// const enterRouteNode = document.querySelector(`.${classes.enterRoute}`)
// const routesNode = document.querySelector(`.${classes.routes}`)

// // Array with routes
// const routesArray = []

// // Route html markup
// const routeMarkup = (name) => {
//     return `
//         <div class="route">
//         <span>${name}</span>
//         <button>Close</button>
//         </div>
//     `
// }

// // Render of the map on the page
// const mapRender = () => {

//     ymaps.ready(() => {

//         let myMap = new ymaps.Map(classes.mapId, {
//             center: [55.76, 37.57],
//             zoom: 9,
//             controls: []
//         })

//         let multiRoute = new ymaps.multiRouter.MultiRoute(
//             {
//                 referencePoints: routesArray
//             },
//             {
//                 boundsAutoApply: true
//             }
//         )

//         myMap.geoObjects.add(multiRoute)
//     })
// }

// mapRender()

// // Add route form input
// const addRoutes = () => {
//     routesArray.push(event.target.value)
//     routesNode.insertAdjacentHTML('beforeend', routeMarkup(event.target.value))
//     event.target.value = ''
//     console.log(routesArray)
//     changeRoutes()
// }

// const changeRoutes = () => {
//     if (routesArray.length > 1) {
//         mapId.innerHTML = '';
//         mapRender()
//     }
// }




// enterRouteNode.addEventListener('change', addRoutes)
// routesNode.innerHTML = routesArray.map((name) => {routeMarkup(name)})