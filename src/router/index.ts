import { createWebHashHistory, createRouter } from "vue-router";
// import Home from "../components/Home.vue";
// import About from "../components/About.vue";
import Spectrum from "../views/spectrum/index.vue";

const routes = [
    {
        path: "/",
        name: "Spectrum",
        component: Spectrum,
    },
    // {
    //     path: "/home",
    //     name: "Home",
    //     component: Home,
    // },
    // {
    //     path: "/about",
    //     name: "About",
    //     component: About,
    // },
    {
      path: '*',
      redirect: '/'
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;