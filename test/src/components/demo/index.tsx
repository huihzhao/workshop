import { client, selectSp } from '@/client';
import { getOffchainAuthKeys } from '@/utils/offchainAuth';
import { Long, OnProgressEvent, VisibilityType } from '@bnb-chain/greenfield-js-sdk';
import { useState } from 'react';
import { useAccount } from 'wagmi';

export const Demo = () => {
  const { address, connector } = useAccount();
  const [info, setInfo] = useState<{
    bucketName: string;
    objectName: string;
    file: File | null;
  }>({
    bucketName: '',
    objectName: '',
    file: null
  });

  return (
    <>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Greenfield Storage Demo
          </h1>
          <p className="subtitle">
            Create Bucket / Create Object / Upload File / Download File
          </p>
        </div>
      </section>

      <div className='box'>
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Bucket</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={info.bucketName}
                  placeholder="bucket name"
                  onChange={(e) => {
                    setInfo({ ...info, bucketName: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="field">
          <button
            className={'button is-primary'}
            onClick={async () => {
            if (!address) return;

            const spInfo = await selectSp();
            console.log('spInfo', spInfo);

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(address, provider);
            if (!offChainData) {
              alert('No offchain, please create offchain pairs first');
              return;
            }

            try {
              const createBucketTx = await client.bucket.createBucket(
                {
                  bucketName: info.bucketName,
                  creator: address,
                  primarySpAddress: spInfo.primarySpAddress,
                  visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
                  chargedReadQuota: Long.fromString('0'),
                  paymentAddress: address,
                },
              );

              const simulateInfo = await createBucketTx.simulate({
                denom: 'BNB',
              });

              console.log('simulateInfo', simulateInfo);

              const res = await createBucketTx.broadcast({
                denom: 'BNB',
                gasLimit: Number(simulateInfo?.gasLimit),
                gasPrice: simulateInfo?.gasPrice || '5000000000',
                payer: address,
                granter: '',
              });

              if (res.code === 0) {
                alert('success');
              }
            } catch (err) {
              console.log(typeof err)
              if (err instanceof Error) {
                alert(err.message);
              }
              if (err && typeof err ==='object') {
                alert(JSON.stringify(err))
              }
            }

          }}
          >
            Create Bucket Tx
          </button>
        </div>
      </div>

      <div className='box'>
        <div className="field is-horizontal">
          <div className="field-label is-normal">
            <label className="label">Object</label>
          </div>
          <div className="field-body">
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={info.objectName}
                  placeholder="object name"
                  onChange={(e) => {
                    setInfo({ ...info, objectName: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="field is-horizontal">
          <div className="file">
            <label className="file-label">
              <input className="file-input" type="file" name="resume" onChange={(e) => {
                if (e.target.files) {
                  setInfo({
                    ...info,
                    file: e.target.files[0]
                  })
                }
              }} />
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fas fa-upload"></i>
                </span>
                <span className="file-label">
                  Choose a file…
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* upload */}
        <div className="field">
          <button
            className="button is-primary"
            onClick={async () => {
              if (!address || !info.file) return;

              const spInfo = await selectSp();
              console.log('spInfo', spInfo);

              const provider = await connector?.getProvider();
              const offChainData = await getOffchainAuthKeys(address, provider);
              if (!offChainData) {
                alert('No offchain, please create offchain pairs first');
                return;
              }

              try {
                const res = await client.object.delegateUploadObject({
                  bucketName: info.bucketName,
                  objectName: info.objectName,
                  body: info.file,
                  delegatedOpts: {
                    visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
                  },
                  onProgress: (e: OnProgressEvent) => {
                    console.log('progress: ', e.percent);
                  },
                }, {
                  type: 'EDDSA',
                  address: address,
                  domain: window.location.origin,
                  seed: offChainData.seedString,
                })

                if (res.code === 0) {
                  alert('create object success');
                }
              } catch (err) {
                console.log(typeof err)
                if (err instanceof Error) {
                  alert(err.message);
                }
                if (err && typeof err ==='object') {
                  alert(JSON.stringify(err))
                }
              }
            }}
          >
            Delegrate Upload
          </button>
        </div>

        {/* Download */}
        <div className='field'>
          <button
            className="button is-primary"
            onClick={async () => {
              if (!address) return;

              const spInfo = await selectSp();
              console.log('spInfo', spInfo);

              const provider = await connector?.getProvider();
              const offChainData = await getOffchainAuthKeys(address, provider);
              if (!offChainData) {
                alert('No offchain, please create offchain pairs first');
                return;
              }

              const res = await client.object.downloadFile(
                {
                  bucketName: info.bucketName,
                  objectName: info.objectName,
                },
                {
                  type: 'EDDSA',
                  address,
                  domain: window.location.origin,
                  seed: offChainData.seedString,
                },
              );

              console.log(res);
            }}
          >
            Download
          </button>
        </div>
      </div>
    </>
  );
};
