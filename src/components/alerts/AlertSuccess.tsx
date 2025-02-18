import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { closeAlertSuccess } from '../../redux/reducers/alertSlice';
import { Modal } from 'react-bootstrap';
import { FaCircleCheck } from 'react-icons/fa6';
export default function AlertSuccess(): React.JSX.Element {
  const dispatch = useAppDispatch();

  var _showStatus = useAppSelector((state) => state.alertReducer.successModal.showStatus);
  var _timeOut = useAppSelector((state) => state.alertReducer.successModal.timeOut);
  var _message = useAppSelector((state) => state.alertReducer.successModal.message);
  var _callback = useAppSelector((state) => state.alertReducer.successModal.callback);

  useEffect(() => {
    if (_showStatus) {
      setTimeout(() => {
        dispatch(closeAlertSuccess());
        if (_callback != undefined) {
          _callback();
        }
      }, _timeOut);
    }
  }, [_showStatus]);

  const handleClose = () => dispatch(closeAlertSuccess());
  return (
    <Modal show={_showStatus} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCircleCheck size={45} color="#26A560" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='p-4'>
        <h4 className='text-center'>
          {_message}
        </h4>
      </Modal.Body>
    </Modal>
  );
}
