from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import numpy as np

HOST_NAME = 'localhost'
PORT_NUMBER = 8000
HIDDEN_LAYER_NODE_COUNT = 15

#load preset sample data and labels into a matrix:
#data_samples = np.loadtxt(open('data.csv', 'rb'), delimiter=',')
#data_labels = np.loadtxt(open('datalabels.csv', 'rb'), delimiter=',')

#convert from numpy ndarrays to python list
#data_samples = data_samples.tolist()
#data_labels = data_labels.tolist()

#nn = CreateNN_OCR()
class JSONHandler(BaseHTTPRequestHandler):
    def do_POST(s):
        response_code = 200
        response = ""
        var_len = int(s.headers.get('Content-Length'))
        content = s.rfile.read(var_len);
        payload = json.loads(content)
        if payload.get('train'):
            print("Training: ")
         #   nn.train(payload['trainArray'])
          #  nn.save()
            response = {'type':'training', 'result': 'done'}
        elif payload.get('predict'):
            try:
                response = {'type': 'test', 'result':'1'} # nn.predict(str(payload['data']))
            except:
                response_code = 500
        else:
            response_code = 400

        s.send_response(response_code)
        s.send_header("Content-type", "application/json")
        s.send_header("Access-Control-Allow-Origin", "*")
        s.end_headers()
        if response:
            s.wfile.write(json.dumps(response).encode())
        return


if __name__ == '__main__':
    server_class = HTTPServer
    httpd = server_class((HOST_NAME, PORT_NUMBER), JSONHandler)
    print("Server running on port ", PORT_NUMBER)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    else:
        print("unexpected server exception occurred.")
    finally:
       httpd.server_close() 