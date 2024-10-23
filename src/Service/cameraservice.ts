export type CameraCommand =
  | 'up_start'
  | 'up_stop'
  | 'down_start'
  | 'down_stop'
  | 'leftup_start'
  | 'leftup_stop'
  | 'left_start'
  | 'left_stop'
  | 'go_home'
  | 'right_start'
  | 'right_stop'
  | 'leftdown_start'
  | 'leftdown_stop'
  | 'rightdown_start'
  | 'rightdown_stop'
  | 'rightup_start'
  | 'rightup_stop'
  | 'zoomadd_start'
  | 'zoomadd_stop'
  | 'zoomdec_start'
  | 'zoomdec_stop'
  | 'focusadd_start'
  | 'focusadd_stop'
  | 'focusdec_start'
  | 'focusdec_stop';

const API_URL = 'http://192.168.5.163/ajaxcom';
export const adjustCamera = async (command: CameraCommand): Promise<void> => {
  const szCmd = {
    SysCtrl: {
      PtzCtrl: {
        nChanel: 0,
        szPtzCmd: command,
        byValue: 60,
      },
    },
  };
  // Convert the command object to a JSON string
  const jsonPayload = JSON.stringify(szCmd);
  // URL-encode the JSON payload
  const urlEncodedPayload = `szCmd=${encodeURIComponent(jsonPayload)}`;
  console.log('Encoded Payload:', urlEncodedPayload);
  try {
    const response = await fetch(API_URL, {
      headers: {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
      },
      referrerPolicy: 'no-referrer',
      body: urlEncodedPayload,
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Camera adjustment successful:', data);
  } catch (error) {
  }
};