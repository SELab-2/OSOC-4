/**
 * This is a page that just shows an errormessage.
 * @param props props contains status and message. status is the error status. message is the error message.
 * @returns {JSX.Element} A component that renders an error message.
 * @constructor
 */
export default function ErrorPage(props) {
    return (
        <div>
            <h1>{props.status}</h1>
            <p>{props.message}</p>
        </div>
    )
}
