const SuccessMessage = ({ children }) => {
    console.log("error", children);
      return (
        <div
          style={{
            width: "95%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 4,
            backgroundColor: "green",
            textAlign: "center",
            color: "white",
            textTransform: "capitalize",
          }}
        >
          {children}
        </div>
      );
    };
    
    export default SuccessMessage;
  