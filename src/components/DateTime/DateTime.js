import Clock from 'react-live-clock';

const DateTime = () => {

    const d = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weeks = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    return (
        <div>
            <div className="date-time">
                <Clock format={'hh:mm A'} ticking={true} className='meeting-clock' />
                <p>{weeks[d.getDay()]}, {months[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</p>
            </div>
        </div>
    );
}

export default DateTime;