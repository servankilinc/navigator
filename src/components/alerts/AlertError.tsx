import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { closeAlertError } from '../../redux/reducers/alertSlice'; 
import { Modal } from 'react-bootstrap';
import { FaTriangleExclamation } from 'react-icons/fa6';
export default function AlertError(): React.JSX.Element {
  const dispatch = useAppDispatch();

  var _showStatus = useAppSelector((state) => state.alertReducer.errorModal.showStatus);
  var _timeOut = useAppSelector((state) => state.alertReducer.errorModal.timeOut);
  var _message = useAppSelector((state) => state.alertReducer.errorModal.message);
  var _callback = useAppSelector((state) => state.alertReducer.errorModal.callback);

  useEffect(() => {
    if (_showStatus) {
      setTimeout(() => {
        dispatch(closeAlertError());
        if (_callback != undefined) {
          console.log('code-1 = ');
          _callback();
        }
      }, _timeOut);
    }
  }, [_showStatus]);
  const handleClose = () => dispatch(closeAlertError());

  return (
    <Modal show={_showStatus} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FaTriangleExclamation size={38} color="#dc2626" />
        {_message}
      </Modal.Body>
    </Modal>
  );
}
