const classes = {
    container: 'container',
    navigation: 'nav',
    mapId: 'map',
    classMap: 'map',
    enterRoute: 'enterRoute',
    routes: 'routes',
    route: 'route',
    activeUp: 'route--active-up',
    activeDown: 'route--active-down',
    placeholder: 'placeHolder'
}

class Routes {
    constructor(element, option = {}) {

        this.container = element

        // Array with routes
        this.routesArray = ['Пушкино', 'Москва', 'Подольск']

        this.dragCurrentRoute = null;
        this.dropCurrentRoute = null;

        this.startClick = null;
        this.shiftX = null;
        this.shiftY = null;

        // Ссылка, куда будем скидывать перетаскиваемый элемент
        this.currentDroppAble = null;

        // Bind functions
        this.manageHTML = this.manageHTML.bind(this)
        this.mapRender = this.mapRender.bind(this)
        this.setEvents = this.setEvents.bind(this)
        this.addRoute = this.addRoute.bind(this)
        this.setParameters = this.setParameters.bind(this)
        this.changeRoutes = this.changeRoutes.bind(this)
        this.dragStart = this.dragStart.bind(this)
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

    // Event pointerdown
    dragStart() {
        this.startClick = event;

        // Заменяем на тот, по которому кликнули
        this.startClick.target.replaceWith(createPlaceholderNode);

        // Берем координаты Placeholder от верхнего левого угла
        let coordinatesOfPlaceholder = document.elementFromPoint(event.pageX, event.pageY).getBoundingClientRect();

        // Из расстояния от мыши до экрана (clientY/X)
        // Вычитаем координаты из Placeholder
        // Что бы курсор не сдвигался в центр перетаскиваемого элемента
        shiftX = event.clientX - coordinatesOfPlaceholder.left;
        shiftY = event.clientY - coordinatesOfPlaceholder.top;

        // Настраиваем движущийся элемент и добавляем в body
        this.startClick.target.style.position = 'absolute';
        this.startClick.target.style.zIndex = 1000;
        document.body.append(startClick.target);
    }

}

// ----------- Helpers
const routeMarkup = (name) => {
    return `
        <div class="route" >
            <span>${name}</span>
            <button>Close</button>
        </div>
    `
}

// Создаем элемент Placeholder
const createPlaceholderNode = () => {
    const placeholderNode = document.createElement('div');
    placeholderNode.classList.add(classes.placeholder);

    return placeholderNode
}


