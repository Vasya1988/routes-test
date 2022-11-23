const classes = {
    container: 'container',
    navigation: 'nav',
    mapId: 'map',
    classMap: 'map',
    enterRoute: 'enterRoute',
    routes: 'routes',
    route: 'route'
}

class Routes {
    constructor(element, option = {}) {

        this.container = element

        // Array with routes
        this.routesArray = ['Пушкино', 'Москва']

        // Bind functions
        this.manageHTML = this.manageHTML.bind(this)
        this.mapRender = this.mapRender.bind(this)
        this.setEvents = this.setEvents.bind(this)
        this.addRoute = this.addRoute.bind(this)
        this.setParameters = this.setParameters.bind(this)
        this.changeRoutes = this.changeRoutes.bind(this)
        this.startDrag = this.startDrag.bind(this)
        this.dragging = this.dragging.bind(this)
        this.stopDrag = this.stopDrag.bind(this)
        this.setStylePosition = this.setStylePosition.bind(this)

        // Run functions
        this.manageHTML()
        this.setEvents()
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

    }

    setEvents() {
        // Get input value of route
        this.enterRouteNode.addEventListener('change', this.addRoute)

        this.routesNode.addEventListener('pointerdown', this.startDrag)
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
        this.clickRoute = event
        this.clickY = event.pageY
        this.routeNode = event.target
        console.log('Start drag --> ', this.clickY)
        console.log(event.target)
        window.addEventListener('pointermove', this.dragging)
    }
    dragging() {
        this.moving = event.pageY
        console.log('Moving --> ', this.moving)
        this.shift = this.moving - this.clickY
        this.setStylePosition(this.shift)
        
    }
    stopDrag() {
        this.endDrag = event.pageY
        window.removeEventListener('pointermove', this.dragging)
        console.log('The remove is done')
        console.log('End drag', this.endDrag)
        console.log('Shift is stop --> ', this.shift)
    }
    setStylePosition(shift) {
        this.routeNode.style.transform = `translateY(${shift}px)`
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