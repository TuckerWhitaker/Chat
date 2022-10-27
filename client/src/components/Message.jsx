import "../pages/MainPage.css"

function Message(props) {
    return(
        <div className="msg">
        <div className="Cinfo">
          <div className="Cname">{props.Message[0]}</div>
          <div className="Cdate">{props.Message[2]}</div>
        </div>
        <div className="CMessage">{props.Message[1]}</div>
      </div>
    )
}

export default Message;