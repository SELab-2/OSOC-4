import {useRouter} from "next/router";


/**
 * The page corresponding with the 'index' (dashboard) of the application,
 *  the params are filled in by nextjs from the function defined below (getServerSideProps)
 * @returns {JSX.Element}
 */
function Home() {
    const router = useRouter();
    router.push("/select-students");
    return null;
}


export default Home;