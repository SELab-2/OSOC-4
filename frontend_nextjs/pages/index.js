import {useRouter} from "next/router";


/**
 * The page corresponding with the 'index' of the application, as we have no index page, we simply re-route to select-students
 *  the params are filled in by nextjs from the function defined below (getServerSideProps)
 * @returns {JSX.Element}
 */
function Home() {
    const router = useRouter();
    router.push("/select-students");
    return null;
}


export default Home;