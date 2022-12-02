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
        this.changeDragList = this.changeDragList.bind(this)

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
            route.addEventListener('dragstart', this.startDrag)
            
        })
        // window.addEventListener('dragenter', this.dragEnter)
        // window.addEventListener('dragleave', this.dragLeave)
        window.addEventListener('dragend', this.stopDrag)

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
        this.currentList = this.changeDragList()
        console.log('start current list --> ', this.currentList)
        this.dragCurrentRoute = {route: event.currentTarget, index: this.routeNode.indexOf(event.target)}
        this.routeNode.map((route) => {
            if (route != event.target) {
                route.addEventListener('dragenter', this.dragEnter)
                route.addEventListener('dragleave', this.dragLeave)
            }
        })
        console.log('Start drag --> ', this.dragCurrentRoute);
    }
    stopDrag() {
        if (event.target.parentNode === this.routesNode) {
            console.log('Stop drag --> ', this.dropCurrentRoute)
        }
        Array.from(this.routesNode.children).map((item) => {
            item.removeEventListener('dragenter', this.dragEnter)
            item.removeEventListener('dragleave', this.dragLeave)
        })

        if (this.dropCurrentRoute != null) {
            const children = Array.from(this.dropCurrentRoute.route.parentElement.children);
            const draggIndex = children.indexOf(this.dragCurrentRoute.route);
            const dropIndex = children.indexOf(this.dropCurrentRoute.route);

            if (draggIndex > dropIndex) {
                this.dragCurrentRoute.route.parentElement.insertBefore(this.dragCurrentRoute.route, this.dropCurrentRoute.route)
    
            } else {
                this.dragCurrentRoute.route.parentElement.insertBefore(this.dragCurrentRoute.route, this.dropCurrentRoute.route.nextElementSibling)
            }
            
            console.log('End current list --> ', this.changeDragList())
        }        
    }
    changeDragList() {
        const list = document.querySelectorAll('.route')
        console.log('New route --> ', list)
        return Array.from(list)
    }
    dragEnter() {
        console.log('DragEnter -->', event.target)
        event.target.classList.add(classes.activeUp)
        this.dropCurrentRoute = {route: event.target, index: this.routeNode.indexOf(event.target)}
    }
    dragLeave() {
        event.target.classList.remove(classes.activeUp)
        console.log('dragLeave --> ', event.target)
    }
}

// ----------- Helpers
const routeMarkup = (name) => {
    return `
        <div class="route" draggable="true">
            <span>${name}</span>
            <button>Close</button>
        </div>
    `
}


