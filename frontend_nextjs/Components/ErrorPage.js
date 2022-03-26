

export default function ErrorPage(props) {
    return (
        <div>
            <h1>{props.status}</h1>
            <p>{props.message}</p>
        </div>
    )
}
