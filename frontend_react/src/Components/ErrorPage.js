

export default function ErrorPage(props) {
    return (
        <div>
            <h1>{props.status}</h1>
            <p1>{props.message}</p1>
        </div>
    )
}
